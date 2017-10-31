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

import com.ericsson.vici.entities.Time;

import java.util.ArrayList;
import java.util.HashMap;

public class Graph {
    private ArrayList<Element> elements;
    private HashMap<String, HashMap<String, Integer>> quantities;
    private Time time;

    public Graph() {
        this.elements = new ArrayList<>();
        this.quantities = new HashMap<>();
        this.time = new Time();
    }

    public void increaseInfo(String category, String value) {
        if (!quantities.containsKey(category)) {
            quantities.put(category, new HashMap<>());
        }
        if (!quantities.get(category).containsKey(value)) {
            quantities.get(category).put(value, 0);
        }
        quantities.get(category).put(value, quantities.get(category).get(value) + 1);
    }

    public Time getTime() {
        return time;
    }

    public void setTime(Time time) {
        this.time = time;
    }

    public ArrayList<Element> getElements() {
        return elements;
    }

    public void setElements(ArrayList<Element> elements) {
        this.elements = elements;
    }

    public HashMap<String, HashMap<String, Integer>> getQuantities() {
        return quantities;
    }

    public void setQuantities(HashMap<String, HashMap<String, Integer>> quantities) {
        this.quantities = quantities;
    }
}
