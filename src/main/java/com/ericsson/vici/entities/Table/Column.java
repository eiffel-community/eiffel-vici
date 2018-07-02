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
package com.ericsson.vici.entities.Table;

public class Column {
    private String title;
    private String data;
    private String defaultContent = "";
    private boolean visible = true;
    // 0 = no render
    // 1 = render time
    private int renderType = 0;

    public Column(String title, String data) {
        this.title = title;
        this.data = data;
    }

    public Column(String title, String data, boolean visible) {
        this.title = title;
        this.data = data;
        this.visible = visible;
    }

    public Column(String title, String data, boolean visible, int renderType) {
        this.title = title;
        this.data = data;
        this.visible = visible;
        this.renderType = 1;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public String getDefaultContent() {
        return defaultContent;
    }

    public void setDefaultContent(String defaultContent) {
        this.defaultContent = defaultContent;
    }

    public boolean isVisible() {
        return visible;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
    }

    public int getRenderType() {
        return renderType;
    }

    public void setRenderType(int renderType) {
        this.renderType = renderType;
    }
}
