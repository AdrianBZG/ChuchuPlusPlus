/**
 * @author Adrián Rodríguez Bazaga
 * @version 0.0.1
 * @date 6 June 2016
 * @email alu0100826456@ull.edu.es / arodriba@ull.edu.es
 * @subject Procesadores de Lenguajes
 * @title Chuchu++ Code Generator - File Handler Class
 */

package helpers;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

public class FileHandler {
  private static String lastReadFile;
  
  public static void readFile(String fileName) {
      byte[] encoded = null;
      try {
        encoded = Files.readAllBytes(Paths.get(fileName));
      } catch (IOException e) {
        e.printStackTrace();
      }
      lastReadFile = new String(encoded, StandardCharsets.UTF_8);      
  }

  public static String getLastReadFile() {
    return lastReadFile;
  }

  public static void setLastReadFile(String lastReadFile) {
    FileHandler.lastReadFile = lastReadFile;
  }
}
