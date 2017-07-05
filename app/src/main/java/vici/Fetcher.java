package vici;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import vici.entities.*;
import vici.entities.Eiffel.EiffelEvent;

import java.util.ArrayList;
import java.util.HashMap;

import static vici.api.ApiController.getTarget;
import static vici.entities.Event.*;

public class Fetcher {
    public static final String TEST_CASE = "TestCase";
    public static final String ACTIVITY = "Activity";
    public static final String TEST_SUITE = "TestSuite";

    public static HashMap<String, EventCache> eventCaches = new HashMap<>();
    public static long cacheLifetime = 86400000;

    public Fetcher() {
    }

    public Events getEvents(String url) {
        return getEvents(url, new ArrayList<>());
    }

    public Events getEvents(String url, ArrayList<UrlProperty> properties) {
        if (eventCaches.containsKey(url)) {
            EventCache eventCache = eventCaches.get(url);
            if (eventCache.getLastUpdate() > System.currentTimeMillis() - cacheLifetime) {
                return eventCache.getEvents();
            }
        }

//        Url urlObject = new Url(url, properties);
        Url urlObject = new Url(url, null);

        System.out.println("Downloading eiffel-events...");

        RestTemplate restTemplate = new RestTemplate();

        ResponseEntity<EiffelEvent[]> responseEntity = restTemplate.getForEntity(urlObject.toString(), EiffelEvent[].class);
        EiffelEvent[] eiffelEvents = responseEntity.getBody();
        MediaType contentType = responseEntity.getHeaders().getContentType();
        HttpStatus statusCode = responseEntity.getStatusCode();

        System.out.println("Downloaded eiffel-events. Importing...");

        int total = eiffelEvents.length;
        int count = 0;
        int lastPrint = count;

        long timeStart = Long.MAX_VALUE;
        long timeEnd = Long.MIN_VALUE;

        HashMap<String, Event> events = new HashMap<>();
        for (EiffelEvent eiffelEvent : eiffelEvents) {
            Event event = new Event(eiffelEvent);
//            if (event.getTime().getStart() < timeStart) {
//                timeStart = event.getTime().getStart();
//            }
//            if (event.getTime().getFinish() > timeEnd) {
//                timeEnd = event.getTime().getFinish();
//            }

            switch (event.getType()) {
                case "EiffelTestCaseTriggeredEvent":
                    event.setType(TEST_CASE);
                    events.put(event.getId(), event);
                    break;

                case "EiffelActivityTriggeredEvent":
                    event.setType(ACTIVITY);
                    events.put(event.getId(), event);
                    break;

                case "EiffelTestSuiteStartedEvent":
                    event.setType(TEST_SUITE);
                    events.put(event.getId(), event);
                    break;

                case "EiffelTestCaseStartedEvent":
                case "EiffelTestCaseFinishedEvent":
                case "EiffelTestCaseCanceledEvent":

                case "EiffelActivityStartedEvent":
                case "EiffelActivityFinishedEvent":
                case "EiffelActivityCanceledEvent":

                case "EiffelTestSuiteFinishedEvent":
                    Event target = null;

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

                                tmpLinks = new ArrayList<>();
                                Event testSuite = null;
                                for (Link link : target.getLinks()) {
                                    if (events.get(link.getTarget()).getType().equals(TEST_SUITE)) {
                                        testSuite = events.get(link.getTarget());
                                        testSuite.addEvent(target);
//                                        events.remove(target.getId());
                                        events.put(target.getId(), new Event(event, testSuite.getId()));
                                    } else {
                                        tmpLinks.add(link);
                                    }
                                }
                                if (testSuite != null) {
                                    for (Link link : tmpLinks) {
                                        testSuite.getLinks().add(link);
                                    }
                                }
                                break;
                        }
                    } else {
                        System.out.println("ERROR: Eiffel wrong links.");
                    }
                    break;

                default:
                    events.put(event.getId(), event);
                    break;
            }

            count++;
            if ((float) count / total > (float) lastPrint / total + 0.1 || count == total || count == 0) {
                System.out.println(count + "/" + total);
                lastPrint = count;
            }
        }

        System.out.println("Finding children...");
        for (String key : events.keySet()) {
            Event event = events.get(key);
            if (!event.getType().equals(REDIRECT)) {
                for (Link link : event.getLinks()) {
                    String target = getTarget(link.getTarget(), events);
                    events.get(target).getChildren().add(new ChildLink(event.getId(), link.getType()));
                }
            }
        }

        Events eventsObject = new Events(events, timeStart, timeEnd);
        eventCaches.put(url, new EventCache(eventsObject));

        System.out.println("Events imported.");
        return eventsObject;
    }
}
