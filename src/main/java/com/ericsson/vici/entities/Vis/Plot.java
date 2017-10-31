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
package com.ericsson.vici.entities.Vis;

import java.util.ArrayList;

/**
 * Author: Jonathan Wahlund.
 * Created on 2017-09-01.
 */
public class Plot {
    private ArrayList<Item> items;
    private long timeFirst;
    private long timeLast;
    private int valueMin;
    private int valueMax;

    public Plot(ArrayList<Item> items, long timeFirst, long timeFinish, int valueMin, int valueMax) {
        this.items = items;
        this.timeFirst = timeFirst;
        this.timeLast = timeFinish;
        this.valueMin = valueMin;
        this.valueMax = valueMax;
    }

    public ArrayList<Item> getItems() {
        return items;
    }

    public void setItems(ArrayList<Item> items) {
        this.items = items;
    }

    public long getTimeFirst() {
        return timeFirst;
    }

    public void setTimeFirst(long timeFirst) {
        this.timeFirst = timeFirst;
    }

    public long getTimeLast() {
        return timeLast;
    }

    public void setTimeLast(long timeLast) {
        this.timeLast = timeLast;
    }

    public int getValueMin() {
        return valueMin;
    }

    public void setValueMin(int valueMin) {
        this.valueMin = valueMin;
    }

    public int getValueMax() {
        return valueMax;
    }

    public void setValueMax(int valueMax) {
        this.valueMax = valueMax;
    }
}
