import anthropic
import os
import json
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class CircuitDesignAgent:
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the circuit design agent with Anthropic API key."""
        if api_key:
            self.client = anthropic.Anthropic(api_key=api_key)
        else:
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if not api_key:
                raise ValueError("Anthropic API key is required. Set ANTHROPIC_API_KEY in .env file or pass api_key parameter.")
            self.client = anthropic.Anthropic(api_key=api_key)
        
        self.conversation_history = []
        self.user_requirements = {}
    
    def start_design_session(self, initial_description: str) -> str:
        """Start a new circuit design session with initial description."""
        self.conversation_history = []
        self.user_requirements = {"initial_description": initial_description}
        
        # Create the initial prompt
        system_prompt = """You are a circuit design assistant. Your role is to ask strategic, specific questions to understand the user's circuit requirements better. 

Guidelines:
- Ask 2-3 specific, objective questions at a time
- Focus on practical aspects: application, constraints, component preferences
- Keep questions concise and technical
- Don't ask open-ended questions
- Questions should be directly related to the circuit type mentioned

Example good questions:
- "What is the target frequency range for this oscillator?"
- "Do you have any power supply constraints (voltage/current limits)?"
- "Are there any specific component brands or types you prefer to use?"

Example bad questions:
- "What do you want to do with this circuit?" (too vague)
- "Tell me more about your project" (too open-ended)"""

        user_prompt = f"I want to design a circuit: {initial_description}. Please ask me 2-3 specific questions to understand my requirements better."

        response = self._get_claude_response(system_prompt, user_prompt)
        self.conversation_history.append({"role": "assistant", "content": response})
        
        return response
    
    def process_user_response(self, user_response: str) -> str:
        """Process user's response and ask follow-up questions or provide recommendations."""
        self.conversation_history.append({"role": "user", "content": user_response})
        
        system_prompt = """You are a circuit design assistant. Based on the user's responses, either:
1. Ask 1-2 more specific follow-up questions if you need more information
2. Provide a brief summary of requirements and ask if they want to proceed with design recommendations

Keep responses concise and focused on gathering practical circuit design requirements."""

        # Build conversation context
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(self.conversation_history)
        
        response = self._get_claude_response_from_messages(messages)
        self.conversation_history.append({"role": "assistant", "content": response})
        
        return response
    
    def generate_circuit_design(self) -> dict:
        """Generate structured circuit design JSON optimized for React frontend with signal type-based connections."""
        system_prompt = """
You are a circuit design expert. Based on the conversation history, generate a structured JSON response for a React frontend that will display an interactive functional block diagram of the circuit.

CRITICAL: You must respond with ONLY valid JSON. No text before or after the JSON. No explanations outside the JSON structure.

The JSON must follow this exact structure:
{
  "circuit_info": {
    "name": "string",
    "description": "string",
    "supply_voltage": "string (ex: ±12V, +5V, etc.)",
    "categories": ["string", "string", ...]
  },
  "blocks": [
    {
      "id": "unique_block_id",
      "name": "display_name",
      "function": "detailed_function_description",
      "position": {"x": 0, "y": 0},
      "inputs": [
        {
          "signal_type": "signal_type_name",
          "name": "input_display_name",
          "required": true,
          "description": "what this input does"
        }
      ],
      "outputs": [
        {
          "signal_type": "signal_type_name", 
          "name": "output_display_name",
          "description": "what this output provides"
        }
      ],
      "implementation": "string (how it is implemented, ex: OTA integrator core)",
      "how_it_works": "string (explain the working principle, cite the concept or subcircuit name)",
      "keywords": ["string", "string", ...],
      "main_components": ["string", ...],
      "parameters": {"param": "value", ...},
      "adjustment": "string (how to adjust/calibrate)",
      "test_points": ["string", ...],
      "troubleshooting": "string (diagnostic tips)",
      "alternatives": [
        {"method": "string", "pros": ["string"], "cons": ["string"]}
      ]
    }
  ],
  "signal_flow": [
    {
      "signal_type": "signal_type_name",
      "from_block": "source_block_id",
      "to_block": "destination_block_id",
      "description": "what this signal carries"
    }
  ]
}

SIGNAL TYPES TO USE:
- "audio_signal" - Audio signals (oscillator output, processed audio)
- "cv_signal" - Control voltage (1V/oct, modulation, etc.)
- "gate_signal" - Gate/trigger signals
- "sync_signal" - Synchronization signals
- "power_12v" - +12V power supply
- "power_neg12v" - -12V power supply
- "power_5v" - +5V power supply
- "ground" - Ground connections

POSITIONING GUIDELINES:
- Input blocks: x=0, y=0 to y=300
- Processing blocks: x=200 to x=400, y=0 to y=300
- Output blocks: x=600, y=0 to y=300
- Power blocks: x=300, y=400

Guidelines:
- Each block represents a function (ex: Oscillator Core, Waveshaper, Output Buffer)
- Use signal_type to connect blocks automatically
- Position blocks logically from left to right
- For each block, explain the working principle in 'how_it_works'
- Include practical fields: main_components, parameters, adjustment, test_points, troubleshooting
- RESPOND WITH ONLY JSON, NO EXPLANATIONS"""

        # Build conversation context
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(self.conversation_history)
        # Add explicit user instruction to output only JSON
        messages.append({
            "role": "user",
            "content": "Now generate only the structured circuit JSON with the new format: circuit_info, blocks (with position, inputs/outputs by signal_type), and signal_flow (connections between blocks). Use the defined signal types (audio_signal, cv_signal, gate_signal, etc.) and position the blocks following the guidelines. No explanations, only JSON."
        })
        
        response = self._get_claude_response_from_messages(messages)
        
        # Debug: Print the raw response
        print(f"Debug - Raw Claude response: {response[:200]}...")
        
        try:
            # Extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start != -1 and json_end != 0:
                json_str = response[json_start:json_end]
                print(f"Debug - Extracted JSON: {json_str[:200]}...")
                parsed_json = json.loads(json_str)
                
                # Validate the circuit design
                validation_result = self.validate_circuit_design(parsed_json)
                if validation_result["valid"]:
                    return parsed_json
                else:
                    return {"error": "Circuit design validation failed", "validation_errors": validation_result["errors"], "raw_response": response}
            else:
                return {"error": "Could not parse JSON response", "raw_response": response}
        except json.JSONDecodeError as e:
            return {"error": f"JSON parsing error: {str(e)}", "raw_response": response}
    
    def _get_claude_response(self, system_prompt: str, user_prompt: str) -> str:
        """Get response from Claude API."""
        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=4000,
                temperature=0.7,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_prompt}
                ]
            )
            
            # Check if response has content
            if not response.content or len(response.content) == 0:
                return "Error: Empty response from Claude API"
            
            return response.content[0].text.strip()
        except Exception as e:
            return f"Error communicating with Claude: {str(e)}"
    
    def _get_claude_response_from_messages(self, messages: List[Dict[str, str]]) -> str:
        """Get response from Claude API using message history."""
        try:
            # Extract system message and user messages
            system_message = ""
            user_messages = []
            
            for msg in messages:
                if msg["role"] == "system":
                    system_message = msg["content"]
                else:
                    user_messages.append({"role": msg["role"], "content": msg["content"]})
            
            print(f"Debug - System message length: {len(system_message)}")
            print(f"Debug - User messages count: {len(user_messages)}")
            
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=4000,
                temperature=0.7,
                system=system_message,
                messages=user_messages
            )
            
            print(f"Debug - Response object: {type(response)}")
            print(f"Debug - Response content: {response.content}")
            
            # Check if response has content
            if not response.content or len(response.content) == 0:
                return "Error: Empty response from Claude API"
            
            return response.content[0].text.strip()
        except Exception as e:
            print(f"Debug - Exception details: {str(e)}")
            return f"Error communicating with Claude: {str(e)}"
    
    def validate_circuit_design(self, design: dict) -> dict:
        """Validate circuit design JSON structure and signal flow consistency."""
        errors = []
        
        # Check required top-level fields
        required_fields = ["circuit_info", "blocks", "signal_flow"]
        for field in required_fields:
            if field not in design:
                errors.append(f"Missing required field: {field}")
        
        if "circuit_info" in design:
            # Check circuit_info structure
            circuit_info = design["circuit_info"]
            required_info_fields = ["name", "description", "supply_voltage"]
            for field in required_info_fields:
                if field not in circuit_info:
                    errors.append(f"Missing circuit_info field: {field}")
        
        if "blocks" in design:
            blocks = design["blocks"]
            if not isinstance(blocks, list):
                errors.append("blocks must be a list")
            else:
                block_ids = set()
                for i, block in enumerate(blocks):
                    # Check required block fields
                    required_block_fields = ["id", "name", "function", "position", "inputs", "outputs"]
                    for field in required_block_fields:
                        if field not in block:
                            errors.append(f"Block {i}: Missing required field: {field}")
                    
                    # Check for duplicate block IDs
                    if "id" in block:
                        if block["id"] in block_ids:
                            errors.append(f"Duplicate block ID: {block['id']}")
                        block_ids.add(block["id"])
                    
                    # Validate inputs and outputs
                    for io_type in ["inputs", "outputs"]:
                        if io_type in block and isinstance(block[io_type], list):
                            for j, io in enumerate(block[io_type]):
                                if "signal_type" not in io:
                                    errors.append(f"Block {block.get('id', i)}: {io_type}[{j}] missing signal_type")
        
        if "signal_flow" in design and "blocks" in design:
            signal_flow = design["signal_flow"]
            if not isinstance(signal_flow, list):
                errors.append("signal_flow must be a list")
            else:
                # Get all block IDs for reference checking
                block_ids = {block.get("id") for block in design["blocks"] if "id" in block}
                
                for i, flow in enumerate(signal_flow):
                    # Check required signal flow fields
                    required_flow_fields = ["signal_type", "from_block", "to_block"]
                    for field in required_flow_fields:
                        if field not in flow:
                            errors.append(f"Signal flow {i}: Missing required field: {field}")
                    
                    # Check if referenced blocks exist
                    if "from_block" in flow and flow["from_block"] not in block_ids:
                        errors.append(f"Signal flow {i}: from_block '{flow['from_block']}' not found")
                    if "to_block" in flow and flow["to_block"] not in block_ids:
                        errors.append(f"Signal flow {i}: to_block '{flow['to_block']}' not found")
        
        return {"valid": len(errors) == 0, "errors": errors}
    
    def suggest_block_positions(self, blocks: list) -> list:
        """Suggest optimal positions for blocks based on signal flow and block types."""
        positioned_blocks = []
        
        # Define block type categories and their preferred positions
        input_blocks = ["input", "cv_input", "gate_input", "audio_input"]
        processing_blocks = ["oscillator", "filter", "amplifier", "mixer", "waveshaper", "vca", "envelope"]
        output_blocks = ["output", "buffer", "audio_output"]
        power_blocks = ["power", "regulator", "supply"]
        
        input_y = 0
        processing_y = 0
        output_y = 0
        power_y = 0
        
        for block in blocks:
            block_copy = block.copy()
            block_type = block.get("function", "").lower()
            
            # Determine position based on block type
            if any(inp in block_type for inp in input_blocks):
                block_copy["position"] = {"x": 0, "y": input_y}
                input_y += 100
            elif any(proc in block_type for proc in processing_blocks):
                block_copy["position"] = {"x": 300, "y": processing_y}
                processing_y += 100
            elif any(out in block_type for out in output_blocks):
                block_copy["position"] = {"x": 600, "y": output_y}
                output_y += 100
            elif any(pwr in block_type for pwr in power_blocks):
                block_copy["position"] = {"x": 300, "y": 400}
                power_y += 50
            else:
                # Default to processing area
                block_copy["position"] = {"x": 300, "y": processing_y}
                processing_y += 100
            
            positioned_blocks.append(block_copy)
        
        return positioned_blocks


# Main function moved to scripts/run_agent.py for CLI interface 