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
package com.ericsson.vici.api.entities.settings;


import java.util.HashMap;
import java.util.UUID;

public class Settings {
    public static final String propertiesVersion = "1.0";

    private String version;
    // EiffelEventRepositories
    private HashMap<String, EiffelEventRepository> eiffelEventRepositories;
//            = Arrays.asList(
//            new EiffelEventRepository("Local static dummy file", "localFile[reference-data-set]"),
//            new EiffelEventRepository("EER static dummy file", "http://127.0.0.1:8081/reference-data-set"),
//            new EiffelEventRepository("EER [live] dummy event stream", "http://127.0.0.1:8081/live[reference-data-set]"),
//            new EiffelEventRepository("Docker EER static dummy file", "http://dummy-er:8081/reference-data-set"),
//            new EiffelEventRepository("Docker EER [live] dummy event stream", "http://dummy-er:8081/live[reference-data-set]")
//    );

    public Settings() {
    }

    public Settings(String version) {
        this.version = version;
        this.eiffelEventRepositories = new HashMap<>();
        eiffelEventRepositories.put(UUID.randomUUID().toString(), new EiffelEventRepository("Local static dummy file", "localFile[reference-data-set]"));
        eiffelEventRepositories.put(UUID.randomUUID().toString(), new EiffelEventRepository("EER static dummy file", "http://127.0.0.1:8081/reference-data-set"));
        eiffelEventRepositories.put(UUID.randomUUID().toString(), new EiffelEventRepository("Docker EER static dummy file", "http://dummy-er:8081/reference-data-set"));
        eiffelEventRepositories.put(UUID.randomUUID().toString(), new EiffelEventRepository("Docker EER static dummy file", "http://dummy-er:8081/reference-data-set"));
        eiffelEventRepositories.put(UUID.randomUUID().toString(), new EiffelEventRepository("Docker EER [live] dummy event stream", "http://dummy-er:8081/live[reference-data-set]"));
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public HashMap<String, EiffelEventRepository> getEiffelEventRepositories() {
        return eiffelEventRepositories;
    }

    public void setEiffelEventRepositories(HashMap<String, EiffelEventRepository> eiffelEventRepositories) {
        this.eiffelEventRepositories = eiffelEventRepositories;
    }
}
