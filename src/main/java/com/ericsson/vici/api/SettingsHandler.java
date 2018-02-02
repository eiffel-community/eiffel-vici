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
package com.ericsson.vici.api;


import com.ericsson.vici.api.entities.settings.EiffelEventRepository;
import com.ericsson.vici.api.entities.settings.Settings;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

import java.io.File;
import java.io.IOException;

import static com.ericsson.vici.api.entities.settings.Settings.propertiesVersion;

public class SettingsHandler {
    private static final String propertiesFileName = "settings.json";


    public SettingsHandler() {
        Settings settings = getSettings();
        if (settings == null) {
            resetSettingsDefault();
        } else if (settings.getVersion() == null || !settings.getVersion().equals(propertiesVersion)) {
            resetSettingsDefault();
        }
    }

    public void deleteEiffelRepository(String id) {
        Settings settings = getSettings();
        settings.getEiffelEventRepositories().remove(id);
        saveSettings(settings);
    }

    public void newEiffelRepository(EiffelEventRepository eiffelEventRepository) {
        Settings settings = getSettings();
        settings.getEiffelEventRepositories().put(eiffelEventRepository.getId(), eiffelEventRepository);
        saveSettings(settings);
    }

    public Settings getDefaultSettings() {
        return new Settings(propertiesVersion);
    }

    public void saveSettings(Settings settings) {
        ObjectMapper mapper = new ObjectMapper();
//        try {
//            mapper.writeValue(new File(propertiesFileName), settings);
//        } catch (IOException e) {
//            e.printStackTrace();
//        }

        ObjectWriter writer = mapper.writer(new DefaultPrettyPrinter());
        try {
            writer.writeValue(new File(propertiesFileName), settings);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public Settings resetSettingsDefault() {
        saveSettings(getDefaultSettings());
        return getSettings();
    }

    public Settings getSettings() {
        ObjectMapper mapper = new ObjectMapper();

        File file = new File(propertiesFileName);

        if (!file.exists()) {
            resetSettingsDefault();
        }

        try {
            return mapper.readValue(new File(propertiesFileName), Settings.class);
        } catch (IOException e) {
            e.printStackTrace();
        }

        return null;
    }

    public EiffelEventRepository getDefaultRepository() {
        return new EiffelEventRepository();
    }
}
