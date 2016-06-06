/**
 * @author Adrián Rodríguez Bazaga
 * @version 0.0.1
 * @date 6 June 2016
 * @email alu0100826456@ull.edu.es / arodriba@ull.edu.es
 * @subject Procesadores de Lenguajes
 * @title Chuchu++ Code Generator - Main Class
 */

package logic;

import helpers.FileHandler;
import helpers.JSONHandler;
import helpers.ProgramHandler;

public class Main {
  public static final String EXAMPLE_PROGRAM_NAME = "codes\\example1.chuchu";

  public static void main(String[] args) {
    // Load the program from file
    FileHandler.readFile(EXAMPLE_PROGRAM_NAME);

    // Create the JSON object from the read string
    JSONHandler.setJSONobjectFromString(FileHandler.getLastReadFile());
    
    // Load the program using the ProgramHandler
    ProgramHandler.loadProgram();
    
    // Show generated code
    ProgramHandler.showGeneratedCode();
    
  }
}
