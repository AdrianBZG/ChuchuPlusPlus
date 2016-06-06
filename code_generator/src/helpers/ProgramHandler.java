package helpers;

import java.io.BufferedWriter;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class ProgramHandler {
  // Function types
  public static final String TYPE_ASSIGN = "Assign";
  public static final String TYPE_CALL = "Call";
  public static final String TYPE_RETURN = "Return";

  private static ArrayList<String> mainProgram = new ArrayList<String>();
  private static ArrayList<ArrayList<String>> programFunctions = new ArrayList<ArrayList<String>>();


  public static void loadProgram() {
    loadMainProgram();
    loadProgramFunctions();
  }

  private static void loadMainProgram() {
    // Get the main program part
    JSONObject mainProgramObject = JSONHandler.getJSONobject().getJSONObject("main");
    JSONArray mainProgramChildren = mainProgramObject.getJSONArray("children");

    // Check every children element from the main program
    for (int i = 0; i < mainProgramChildren.length(); i++)
    {
      // Get the type
      String typeOfFunction = mainProgramChildren.getJSONObject(i).getString("type");

      // If it's an assign
      if(typeOfFunction.equals(TYPE_ASSIGN)) {
        // Get the left value
        String leftValue = mainProgramChildren.getJSONObject(i).getJSONObject("left").getString("value");

        // Get the right value
        String rightValue = null;
        try {
          rightValue = mainProgramChildren.getJSONObject(i).getJSONObject("right").getString("value");
        } catch (JSONException e) {
          rightValue = "" + mainProgramChildren.getJSONObject(i).getJSONObject("right").getInt("value");
        }

        addLineToMainProgram("var " + leftValue + " = " + rightValue + ";\n");
      }

      // If it's a call
      if(typeOfFunction.equals(TYPE_CALL)) {
        // Get the called func name
        String calledFunc = mainProgramChildren.getJSONObject(i).getJSONObject("func").getString("value");

        // Get the parameters and add them to an array
        String funcParametersAsString = "";
        JSONArray funcParameters = mainProgramChildren.getJSONObject(i).getJSONArray("arguments");
        for (int j = 0; j < funcParameters.length(); j++)
        {
          if(j > 0) {
            funcParametersAsString += ", ";
          }
          funcParametersAsString += funcParameters.getJSONObject(j).getString("value") + "";
        }

        addLineToMainProgram(calledFunc + "(" + funcParametersAsString + ");\n");
      }
    }
  }

  private static void loadProgramFunctions() {
    JSONArray availableFunctions = JSONHandler.getJSONobject().getJSONArray("functions");
    //System.out.println(availableFunctions.length()); // Cantidad de funciones

    // Check every function
    for (int i = 0; i < availableFunctions.length(); i++)
    {
      // The ArrayList where we'll store the code for THIS function
      ArrayList<String> functionCode = new ArrayList<String>();

      // First, get the function name
      String functionName = availableFunctions.getJSONObject(i).getJSONObject("name").getString("value");

      // Second, get the function parameters
      String funcParametersAsString = "";
      JSONArray funcParameters = availableFunctions.getJSONObject(i).getJSONArray("params");
      for (int j = 0; j < funcParameters.length(); j++)
      {
        if(j > 0) {
          funcParametersAsString += ", ";
        }
        funcParametersAsString += funcParameters.getJSONObject(j).getString("value") + "";
      }

      functionCode.add("function " + functionName + "(" + funcParametersAsString + ")" + " {"); // We have the function header

      // Third, get the function block code
      JSONArray blockCode = availableFunctions.getJSONObject(i).getJSONObject("block").getJSONArray("children");

      // Fourth, loop through each function of the block
      for (int j = 0; j < blockCode.length(); j++)
      {
        String functionType = blockCode.getJSONObject(j).getString("type");   // Get the function type

        // If it's an assign
        if(functionType.equals(TYPE_ASSIGN)) {
          // Get the left value
          String leftValue = blockCode.getJSONObject(i).getJSONObject("left").getString("value");

          // Get the right value
          String rightValue = null;

          // Check if it's a simple assign or a compound assign
          try { // Simple assign
            try {
              rightValue = blockCode.getJSONObject(i).getJSONObject("right").getString("value");
            } catch (JSONException e) {
              rightValue = "" + blockCode.getJSONObject(i).getJSONObject("right").getInt("value");
            }
          } catch (JSONException ej) { // Compound assign
            JSONObject compoundRightValue = blockCode.getJSONObject(i).getJSONObject("right");  // The whole right value object
            String compoundRightValueOperation = compoundRightValue.getString("type");    // The performed operation

            String compoundFirstOperator = null;      // The first operator (can be String or Int)
            try {
              compoundFirstOperator = compoundRightValue.getJSONObject("left").getString("value");
            } catch (JSONException e) {
              compoundFirstOperator = "" + compoundRightValue.getJSONObject("left").getInt("value");
            }

            String compoundSecondOperator = "" + compoundRightValue.getJSONObject("right").getInt("value");;      // The second operator (can be a Int)

            // Now, we put it all together
            rightValue = compoundFirstOperator + " " + compoundRightValueOperation + " " + compoundSecondOperator;

          }
          //

          functionCode.add("  var " + leftValue + " = " + rightValue + ";"); // We add the function
        }

        // If it's an assign
        if(functionType.equals(TYPE_RETURN)) {
          String returnValue = null;

          try {
            returnValue = blockCode.getJSONObject(j).getJSONArray("children").getJSONObject(0).getString("value");
          } catch (JSONException e) {
            returnValue = "" + blockCode.getJSONObject(j).getJSONArray("children").getJSONObject(0).getInt("value");
          }

          functionCode.add("  return " + returnValue + ";"); // We add the function
        }
      }

      functionCode.add("}"); // Add the end bracer
      addFunctionCodeToFunctions(functionCode);
    }
  }

  public static void showGeneratedCode() {
    // Showing the whole program

    // 1. Functions
    for(ArrayList<String> arr : ProgramHandler.getProgramFunctions()) {
      for(String codeLine : arr) {
        System.out.println(codeLine);
      }
      System.out.println(""); // Empty line
    }

    // 2. Main
    for(String codeLine : ProgramHandler.getMainProgram()) {
      System.out.print(codeLine);
    }

    // End
  }

  public static void saveCodeToFile(String fileName) {
    // Saving the whole program to a file

    try {
      
      BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(
          new FileOutputStream(fileName), "utf-8"));
      // 1. Functions
      for(ArrayList<String> arr : ProgramHandler.getProgramFunctions()) {
        for(String codeLine : arr) {
          writer.write(codeLine);
          writer.newLine();
        }
        writer.newLine(); // Empty line
      }

      // 2. Main
      for(String codeLine : ProgramHandler.getMainProgram()) {
        writer.write(codeLine);
      }

      // End
      writer.close();
    } catch (FileNotFoundException | UnsupportedEncodingException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  public static ArrayList<ArrayList<String>> getProgramFunctions() {
    return programFunctions;
  }

  public static void setProgramFunctions(ArrayList<ArrayList<String>> programFunctions) {
    ProgramHandler.programFunctions = programFunctions;
  }

  public static void addFunctionCodeToFunctions(ArrayList<String> function) {
    programFunctions.add(function);
  }

  public static ArrayList<String> getMainProgram() {
    return mainProgram;
  }

  public static void setMainProgram(ArrayList<String> mainProgram) {
    ProgramHandler.mainProgram = mainProgram;
  }

  public static void addLineToMainProgram(String line) {
    mainProgram.add(line);
  }
}
