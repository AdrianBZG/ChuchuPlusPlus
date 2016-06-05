/**
 * @author Adrián Rodríguez Bazaga
 * @version 0.0.1
 * @date 6 June 2016
 * @email alu0100826456@ull.edu.es / arodriba@ull.edu.es
 * @subject Procesadores de Lenguajes
 * @title Chuchu++ Code Generator - JSON Handler Class
 */

package helpers;

import org.json.*;

public class JSONHandler {
  private static JSONObject jsonObject;
  
  public static JSONObject getJSONobject() {
    return jsonObject;
  }
  
  public static void setJSONobject(JSONObject newJSONobject) {
    jsonObject = newJSONobject;
  }
  
  public static void setJSONobjectFromString(String str) {
    setJSONobject(new JSONObject(str));
  }
}
