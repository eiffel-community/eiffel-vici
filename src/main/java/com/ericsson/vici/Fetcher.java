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
package com.ericsson.vici;


import com.ericsson.vici.api.entities.Query;
import com.ericsson.vici.entities.*;
import com.ericsson.vici.entities.Eiffel.CustomData;
import com.ericsson.vici.entities.Eiffel.EiffelEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.JSONObject;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.ericsson.vici.ViciApplication.log;
import static com.ericsson.vici.api.ApiController.getTarget;
import static com.ericsson.vici.entities.Event.*;

public class Fetcher {
    public static final String TEST_CASE = "TestCase";
    public static final String ACTIVITY = "Activity";
    public static final String TEST_SUITE = "TestSuite";

    private static HashMap<String, EventCache> eventCaches = new HashMap<>(); // TODO: a job that removes very old caches för memory cleanup

    public Fetcher() {
    }

    private String getStandardAggregateValue(Event event) {
        switch (event.getType()) {
            case ACTIVITY:
                return event.getThisEiffelEvent().getData().getName();
            case "EiffelAnnouncementPublishedEvent":
                return event.getThisEiffelEvent().getData().getHeading();
            case "EiffelArtifactCreatedEvent":
//            case "EiffelArtifactPublishedEvent": TODO
            case "EiffelArtifactReusedEvent":
                if (event.getThisEiffelEvent().getData().getGav() == null) {
                    log.error("Investigate in Fetcher.getStandardAggregateValue: " + event.getThisEiffelEvent().getMeta().getType());
                }
//                return event.getThisEiffelEvent().getData().getGav().getGroupId() + "[" + event.getThisEiffelEvent().getData().getGav().getArtifactId() + "]";
                return event.getThisEiffelEvent().getData().getGav().getArtifactId();
            case "EiffelCompositionDefinedEvent":
            case "EiffelConfidenceLevelModifiedEvent":
            case "EiffelEnvironmentDefinedEvent":
            case TEST_SUITE:
                return event.getThisEiffelEvent().getData().getName();
            case "EiffelFlowContextDefined":
                return null;
            case "EiffelIssueVerifiedEvent":
                // TODO: -IV: data.issues (notera att detta är en array. Dvs det skulle vara snyggt om samma event kan dyka upp i flera objektrepresentationer i grafen)
                return null;
            case "EiffelSourceChangeCreatedEvent":
            case "EiffelSourceChangeSubmittedEvent":
                // TODO: möjlighet att välja identifier (git/svn/...)

                String type;
                if (event.getType().equals("EiffelSourceChangeCreatedEvent")) {
                    type = "Created";
                } else {
                    type = "Submitted";
                }
                if (event.getThisEiffelEvent().getData().getGitIdentifier() != null) {
//                    return event.getThisEiffelEvent().getData().getGitIdentifier().getRepoUri() + "[" + event.getThisEiffelEvent().getData().getGitIdentifier().getBranch() + "]";
//                    return event.getThisEiffelEvent().getData().getGitIdentifier().getRepoUri();
                    return type + "@" + event.getThisEiffelEvent().getData().getGitIdentifier().getRepoName();
                }
                return null;
            case TEST_CASE:
                return event.getThisEiffelEvent().getData().getTestCase().getId();
            case "EiffelTestExecutionRecipeCollectionCreatedEvent":
                return null;
            default:
                return null;
        }
    }

    private String getAggregateValue(Event event, HashMap<String, String> aggregateKeys) {
        if (aggregateKeys == null || !aggregateKeys.containsKey(event.getType())) {
            String value = getStandardAggregateValue(event);

            if (value == null) {
                if (event.getThisEiffelEvent().getData().getCustomData() != null) {
                    for (CustomData customData : event.getThisEiffelEvent().getData().getCustomData()) {
                        if (customData.getKey().equals("name")) {
                            return "Custom[" + customData.getValue() + "]";
                        }
                    }
                }
            }
            return value;
        }

        String aggregateKey = aggregateKeys.get(event.getType());
        String[] path = aggregateKeys.get(event.getType()).split("\\.");

        return null;
    }

    public Events getEvents(String url, long cacheLifetimeMs) {
        if (eventCaches.containsKey(url)) {
            EventCache eventCache = eventCaches.get(url);
            if (eventCache.getLastUpdate() > System.currentTimeMillis() - cacheLifetimeMs) {
                log.info("Stored cache used for: " + url);
                return eventCache.getEvents();
            }
        }

        log.info("Downloading eiffel-events from: " + url);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<EiffelEvent[]> responseEntity;
        EiffelEvent[] eiffelEvents = null;

        Pattern pattern = Pattern.compile("^localFile\\[(.+)]$");
        Matcher matcher = pattern.matcher(url.trim());

        long eventsFetchedAt = System.currentTimeMillis();

        if (matcher.find()) {
//            System.out.println("Request for local file " + matcher.group(1) + ".json");
//            responseEntity = restTemplate.getForEntity("http://127.0.0.1:8080/" + matcher.group(1), EiffelEvent[].class);

            ObjectMapper mapper = new ObjectMapper();
            Resource resource = new ClassPathResource("static/" + matcher.group(1) + ".json");
            InputStream jsonFileStream;
            try {
                jsonFileStream = resource.getInputStream();
                eiffelEvents = mapper.readValue(jsonFileStream, EiffelEvent[].class);
            } catch (IOException e) {
                e.printStackTrace();
            }
        } else {
            Query query = new Query(null, null, 0, Integer.MAX_VALUE, false, null, true);
            ObjectMapper mapper = new ObjectMapper();
            JSONObject queryJson = null;
            try {
                queryJson = new JSONObject(mapper.writeValueAsString(query));
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = null;
            if (queryJson != null) {
                entity = new HttpEntity<>(queryJson.toString(), headers);
            }

            responseEntity = restTemplate.exchange(url, HttpMethod.POST, entity, EiffelEvent[].class);
            eiffelEvents = responseEntity.getBody();

//            MediaType contentType = responseEntity.getHeaders().getContentType();
//            HttpStatus statusCode = responseEntity.getStatusCode();
        }

        if (eiffelEvents == null) {
            return null;
        }

        log.info("Downloaded eiffel-events. Importing...");

        int total = eiffelEvents.length;
        int count = 0;
        int lastPrint = count;

        long timeStart = Long.MAX_VALUE;
        long timeEnd = Long.MIN_VALUE;

        // Collections.shuffle(Arrays.asList(eiffelEvents)); // for testing a non-ordered set of eiffel data


        HashMap<String, Event> events = new HashMap<>();

        ArrayList<Event> potentialEventToBeMerges = new ArrayList<>();

        // First all trigger events and such (the base events)
        for (EiffelEvent eiffelEvent : eiffelEvents) {
            Event event = new Event(eiffelEvent);

            switch (event.getType()) {
                case "EiffelTestCaseStartedEvent":
                case "EiffelTestCaseFinishedEvent":
                case "EiffelTestCaseCanceledEvent":

                case "EiffelActivityStartedEvent":
                case "EiffelActivityFinishedEvent":
                case "EiffelActivityCanceledEvent":

                case "EiffelTestSuiteFinishedEvent":
                    // Skip at this time
                    break;

                default:
                    switch (event.getType()) {
                        case "EiffelTestCaseTriggeredEvent":
                            event.setType(TEST_CASE);
                            // May be merged into a TestSuite
                            potentialEventToBeMerges.add(event);
                            break;

                        case "EiffelActivityTriggeredEvent":
                            event.setType(ACTIVITY);
                            break;

                        case "EiffelTestSuiteStartedEvent":
                            event.setType(TEST_SUITE);
                            break;

                        default:
                            break;
                    }
                    events.put(event.getId(), event);
                    count++;
                    break;
            }

            // Print progress
            if ((float) count / total > (float) lastPrint / total + 0.1 || count == total || count == 0) {
                log.info(count + "/" + total);
                lastPrint = count;
            }
        }

        // All followup events
        for (EiffelEvent eiffelEvent : eiffelEvents) {
            Event event = new Event(eiffelEvent);

            // If event is not already added, its a followup event
            if (!events.containsKey(event.getId())) {
                Event target = null;

                // Find the target
                ArrayList<Link> tmpLinks = new ArrayList<>();
                for (Link link : event.getLinks()) {
                    if (link.getType().equals("ACTIVITY_EXECUTION") || link.getType().equals("TEST_CASE_EXECUTION") || link.getType().equals("TEST_SUITE_EXECUTION")) {
                        target = events.get(link.getTarget());
                    } else {
                        tmpLinks.add(link);
                    }
                }

                if (target != null) {
                    for (Link link : tmpLinks) {
                        events.get(target.getId()).getLinks().add(link);
                    }

                    events.put(event.getId(), new Event(event, target.getId()));
                    switch (event.getType()) {
                        case "EiffelTestCaseStartedEvent":
                        case "EiffelActivityStartedEvent":
                            target.getEiffelEvents().put(STARTED, event.getEiffelEvents().get(TRIGGERED));
                            target.getTimes().put(STARTED, event.getTimes().get(TRIGGERED));
                            break;
                        case "EiffelTestCaseCanceledEvent":
                        case "EiffelActivityCanceledEvent":
                            target.getEiffelEvents().put(CANCELED, event.getEiffelEvents().get(TRIGGERED));
                            target.getTimes().put(CANCELED, event.getTimes().get(TRIGGERED));
                            break;
                        default:
                            target.getEiffelEvents().put(FINISHED, event.getEiffelEvents().get(TRIGGERED));
                            target.getTimes().put(FINISHED, event.getTimes().get(TRIGGERED));
                            break;
                    }
                } else {
                    log.error("null link while fetching followup events.");
                }
                count++;
                if ((float) count / total > (float) lastPrint / total + 0.1 || count == total || count == 0) {
                    log.info(count + "/" + total);
                    lastPrint = count;
                }
            }
        }

        // Merge test cases into suites
        for (Event event : potentialEventToBeMerges) {
            ArrayList<Link> tmpLinks = new ArrayList<>();
            Event testSuite = null;
            for (Link link : event.getLinks()) {
                if (events.get(link.getTarget()).getType().equals(TEST_SUITE)) {
                    testSuite = events.get(link.getTarget());
                    testSuite.addEvent(event);
                    events.put(event.getId(), new Event(event, testSuite.getId())); // Override with redirect
                } else {
                    tmpLinks.add(link);
                }
            }
            if (testSuite != null) {
                // Pass the test case's links to the test suite
                for (Link link : tmpLinks) {
                    testSuite.getLinks().add(link);
                }
            }
        }

        // Makes the links go both ways.
        log.info("Fining and applying children to all nodes.");
        for (String key : events.keySet()) {
            Event event = events.get(key);
            if (!event.getType().equals(REDIRECT)) {
                for (Link link : event.getLinks()) {
                    String target = getTarget(link.getTarget(), events);
                    events.get(target).getChildren().add(new ChildLink(event.getId(), link.getType()));
                }
            }
        }

        // Sets aggregate values
        for (String key : events.keySet()) {
            Event event = events.get(key);
            if (!event.getType().equals(REDIRECT)) {
                event.setAggregateOn(getAggregateValue(event, null));
            }
        }

        Events eventsObject = new Events(events, timeStart, timeEnd, eventsFetchedAt);
        eventCaches.put(url, new EventCache(eventsObject, eventsFetchedAt));

        log.info("Events imported from: " + url);
        return eventsObject;
    }
}
