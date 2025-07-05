#!/usr/bin/env python3
"""
CLI interface for Circuit Design Agent
"""

import sys
import os
import json

# Add the backend src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend', 'src'))

from circuit_agent import CircuitDesignAgent

def main():
    """Main function to demonstrate the circuit design agent."""
    print("=== Circuit Design Agent (Claude) ===\n")
    
    # Initialize agent
    try:
        agent = CircuitDesignAgent()
    except ValueError as e:
        print(f"Error: {e}")
        print("Please set your Anthropic API key in .env file or pass api_key parameter.")
        return
    
    # Get initial circuit description
    initial_description = input("Describe the circuit you want to design (e.g., 'Make a 555 square wave oscillator'): ")
    
    if not initial_description.strip():
        print("No description provided. Exiting.")
        return
    
    # Start the design session
    print("\n" + "="*50)
    response = agent.start_design_session(initial_description)
    print(f"Agent: {response}")
    
    # Interactive conversation loop
    while True:
        print("\n" + "-"*30)
        user_input = input("Your response (or 'generate' to create circuit design, 'quit' to exit): ")
        
        if user_input.lower() in ['quit', 'exit', 'q']:
            print("Session ended. Goodbye!")
            break
        
        if user_input.lower() == 'generate':
            print("\n" + "="*50)
            print("Generating circuit design...")
            circuit_design = agent.generate_circuit_design()
            
            if "error" in circuit_design:
                print(f"Error: {circuit_design['error']}")
                print(f"Raw response: {circuit_design['raw_response']}")
            else:
                print("Circuit design generated successfully!")
                print("\nJSON Output:")
                print(json.dumps(circuit_design, indent=2))
                
                # Save to file in shared examples
                output_path = os.path.join(os.path.dirname(__file__), '..', 'shared', 'examples', 'sample_circuits', 'circuit_design.json')
                with open(output_path, "w") as f:
                    json.dump(circuit_design, f, indent=2)
                print(f"\nCircuit design saved to '{output_path}'")
            break
        
        if not user_input.strip():
            print("Please provide a response.")
            continue
        
        response = agent.process_user_response(user_input)
        print(f"\nAgent: {response}")


if __name__ == "__main__":
    main()