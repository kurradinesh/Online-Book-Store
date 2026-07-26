package com.booknook.util;

import java.util.HashMap;
import java.util.Map;

public class JsonParser {
    /**
     * Parses a simple flat JSON string into a key-value Map.
     * Handles string values with spaces, commas, and escaped quotes correctly.
     */
    public static Map<String, String> parse(String json) {
        Map<String, String> map = new HashMap<>();
        if (json == null || json.trim().isEmpty()) {
            return map;
        }
        json = json.trim();
        if (json.startsWith("{") && json.endsWith("}")) {
            json = json.substring(1, json.length() - 1).trim();
        }
        
        int i = 0;
        int len = json.length();
        while (i < len) {
            // skip whitespace
            while (i < len && Character.isWhitespace(json.charAt(i))) {
                i++;
            }
            if (i >= len) break;
            
            // expect key
            if (json.charAt(i) != '"') {
                break;
            }
            i++; // skip open quote of key
            int keyStart = i;
            while (i < len && json.charAt(i) != '"') {
                if (json.charAt(i) == '\\' && i + 1 < len) {
                    i++;
                }
                i++;
            }
            if (i >= len) break;
            String key = json.substring(keyStart, i);
            i++; // skip close quote of key
            
            // skip to colon
            while (i < len && json.charAt(i) != ':') {
                i++;
            }
            if (i >= len) break;
            i++; // skip colon
            
            // skip to value start
            while (i < len && Character.isWhitespace(json.charAt(i))) {
                i++;
            }
            if (i >= len) break;
            
            String val = "";
            if (json.charAt(i) == '"') {
                // string value
                i++; // skip open quote
                int valStart = i;
                while (i < len && json.charAt(i) != '"') {
                    if (json.charAt(i) == '\\' && i + 1 < len) {
                        i++;
                    }
                    i++;
                }
                val = json.substring(valStart, i);
                i++; // skip close quote
            } else {
                // numeric, boolean, null
                int valStart = i;
                while (i < len && json.charAt(i) != ',' && json.charAt(i) != '}') {
                    i++;
                }
                val = json.substring(valStart, i).trim();
            }
            
            map.put(key, val);
            
            // skip to next comma
            while (i < len && json.charAt(i) != ',') {
                i++;
            }
            i++; // skip comma
        }
        return map;
    }
}
