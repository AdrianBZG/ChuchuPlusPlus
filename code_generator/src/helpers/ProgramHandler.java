package helpers;

import java.util.ArrayList;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class ProgramHandler {
  // Function types
  public static final String TYPE_ASSIGN = "Assign";
  public static final String TYPE_CALL = "Call";
  
  private static ArrayList<String> mainProgram = new ArrayList<String>();
  private static ArrayList<ArrayList<String>> programFunctions = new ArrayList<ArrayList<String>>();


  public static ArrayList<String> getMainProgram() {
    return mainProgram;
  }

  public static void setMainProgram(ArrayList<String> mainProgram) {
    ProgramHandler.mainProgram = mainProgram;
  }

  public static void addLineToMainProgram(String line) {
    mainProgram.add(line);
  }

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
        System.out.println("var " + leftValue + " = " + rightValue + ";");
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

        System.out.println(calledFunc + "(" + funcParametersAsString + ")");
      }
    }
  }

  private static void loadProgramFunctions() {
    JSONArray arr = JSONHandler.getJSONobject().getJSONArray("functions");
    System.out.println(arr.length()); // Cantidad de funciones
  }

  public static ArrayList<ArrayList<String>> getProgramFunctions() {
    return programFunctions;
  }

  public static void setProgramFunctions(ArrayList<ArrayList<String>> programFunctions) {
    ProgramHandler.programFunctions = programFunctions;
  }
}
