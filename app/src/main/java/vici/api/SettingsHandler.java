package vici.api;


import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import vici.api.entities.settings.EiffelEventRepository;
import vici.api.entities.settings.Settings;

import java.io.File;
import java.io.IOException;

public class SettingsHandler {
    private static final String propertiesFileName = "settings.json";
    private int safeId;

    public SettingsHandler() {
        resetSettingsDefault();

        safeId = getSettings().getEiffelEventRepositories().size();
    }

    public Settings getDefaultSettings() {
        return new Settings();
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
        return new EiffelEventRepository(getNextUniqueId());
    }

    public int getNextUniqueId() {
        int tmp = safeId;
        safeId++;
        return tmp;
    }
}