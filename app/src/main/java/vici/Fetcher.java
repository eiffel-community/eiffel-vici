package vici;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import vici.entities.Eiffel.EiffelEvent;
import vici.entities.*;

import java.util.ArrayList;
import java.util.HashMap;

public class Fetcher {
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
        EiffelEvent[] documents = responseEntity.getBody();
        MediaType contentType = responseEntity.getHeaders().getContentType();
        HttpStatus statusCode = responseEntity.getStatusCode();

        System.out.println("Downloaded eiffel-events. Importing...");

        int total = documents.length;
        int count = 0;
        int lastPrint = count;

        long timeStart = Long.MAX_VALUE;
        long timeEnd = Long.MIN_VALUE;

        HashMap<String, Event> events = new HashMap<>();
        for (EiffelEvent document : documents) {
            Event event = new Event(document);
//            if (event.getTime().getStart() < timeStart) {
//                timeStart = event.getTime().getStart();
//            }
//            if (event.getTime().getFinish() > timeEnd) {
//                timeEnd = event.getTime().getFinish();
//            }

            switch (event.getType()) {
                case "EiffelTestCaseTriggeredEvent":
                    event.setType("TestCase");
                    events.put(event.getId(), event);
                    break;

                case "EiffelActivityTriggeredEvent":
                    event.setType("Activity");
                    events.put(event.getId(), event);
                    break;

                case "EiffelTestSuiteStartedEvent":
                    event.setType("TestSuite");
                    events.put(event.getId(), event);
                    break;

                case "EiffelTestCaseStartedEvent":
                case "EiffelTestCaseFinishedEvent":
                case "EiffelTestCaseCanceledEvent":

                case "EiffelActivityStartedEvent":
                case "EiffelActivityFinishedEvent":
                case "EiffelActivityCanceledEvent":

                case "EiffelTestSuiteFinishedEvent":
                    Event target = events.get(event.getLinks().get(0).getTarget());
                    events.put(event.getId(), new Event(event, target.getId()));
                    switch (event.getType()) {
                        case "EiffelTestCaseStartedEvent":
                        case "EiffelActivityStartedEvent":
                            target.getData().put("started", event.getData().get("triggered"));
                            target.getTimes().put("started", event.getTimes().get("triggered"));
                            break;
                        case "EiffelTestCaseCanceledEvent":
                        case "EiffelActivityCanceledEvent":
                            target.getData().put("canceled", event.getData().get("triggered"));
                            target.getTimes().put("canceled", event.getTimes().get("triggered"));
                            break;
                        default:
                            target.getData().put("finished", event.getData().get("triggered"));
                            target.getTimes().put("finished", event.getTimes().get("triggered"));
                            if (events.get(target.getLinks().get(0).getTarget()).getType().equals("TestSuite")) {
                                Event testSuite = events.get(target.getLinks().get(0).getTarget());
                                testSuite.addEvent(target);
                                events.remove(target.getId());
                                events.put(target.getId(), new Event(event, testSuite.getId()));
                            }
                            break;
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
            for (Link link : event.getLinks()) {
                events.get(link.getTarget()).getChildren().add(event.getId());
            }
        }

        Events eventsObject = new Events(events, timeStart, timeEnd);
        eventCaches.put(url, new EventCache(eventsObject));

        System.out.println("Events imported.");
        return eventsObject;
    }
}
