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
package com.ericsson.vici.api.entities;


import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;

import static com.ericsson.vici.Fetcher.*;

@Data
@NoArgsConstructor
public class Settings {

    @JsonIgnore
    private final String latestVersion = "2.3 - Eiffel-ER with Spring property as default.";

    private String version = latestVersion;

    private HashMap<String, EiffelEventRepository> eiffelEventRepositories = new HashMap<>();

    private String[] types = {
            ACTIVITY,
            "EiffelAnnouncementPublishedEvent",
            "EiffelArtifactCreatedEvent",
//            "EiffelArtifactPublishedEvent",
            "EiffelArtifactReusedEvent",
            "EiffelCompositionDefinedEvent",
            "EiffelConfidenceLevelModifiedEvent",
            "EiffelEnvironmentDefinedEvent",
            TEST_SUITE,
            "EiffelFlowContextDefined",
            "EiffelIssueVerifiedEvent",
            "EiffelSourceChangeCreatedEvent",
            "EiffelSourceChangeSubmittedEvent",
            TEST_CASE,
            "EiffelTestExecutionRecipeCollectionCreatedEvent",
            DEFAULT};

    @JsonIgnore
    public boolean isUpToDate() {
        return version == null || version.equals(latestVersion);
    }
}
