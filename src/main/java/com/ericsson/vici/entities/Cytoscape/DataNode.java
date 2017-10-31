/*
   Copyright 2017 Ericsson AB.
   For a full list of individual contributors, please see the commit history.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
package com.ericsson.vici.entities.Cytoscape;

import java.util.HashMap;

public class DataNode {

    private String id;

    private String label;
    private String type;
    private int quantity;

    private String value;

    private HashMap<String, Integer> quantities;
    private HashMap<String, String> info;
    private HashMap<String, Long> times;

    public DataNode(String id, String label, String type, String value, int quantity) {
        this.id = id;
        this.label = label;
        this.type = type;
        this.quantity = quantity;
        this.value = value;
        this.quantities = new HashMap<>();
        this.info = new HashMap<>();
        this.times = new HashMap<>();
    }

    public DataNode(String id, String label, String type, String value) {
        this.id = id;
        this.label = label;
        this.type = type;
        this.quantity = 1;
        this.value = value;
        this.quantities = new HashMap<>();
        this.info = new HashMap<>();
        this.times = new HashMap<>();
    }

    public void increaseQuantity(String key) {
        if (!quantities.containsKey(key)) {
            quantities.put(key, 1);
        } else {
            quantities.put(key, quantities.get(key) + 1);
        }
        quantity++;
    }

    public HashMap<String, Long> getTimes() {
        return times;
    }

    public void setTimes(HashMap<String, Long> times) {
        this.times = times;
    }

    public HashMap<String, String> getInfo() {
        return info;
    }

    public void setInfo(HashMap<String, String> info) {
        this.info = info;
    }

    public void increaseQuantity() {
        quantity++;
    }

    public HashMap<String, Integer> getQuantities() {
        return quantities;
    }

    public void setQuantities(HashMap<String, Integer> quantities) {
        this.quantities = quantities;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
