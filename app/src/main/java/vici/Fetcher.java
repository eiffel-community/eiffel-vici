package vici;

import org.bson.Document;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import vici.entities.Event;
import vici.entities.Events;
import vici.entities.Url;

import java.util.HashMap;

public class Fetcher {
    public Fetcher() {
    }

    public Events getEvents(String url) {
        return getEvents(url, 0, 0, 0);
    }

    public Events getEvents(String url, long from, long to, int limit) {
        Url urlObject = new Url(url);
        if (from > 0) {
            urlObject.addProperty("from", String.valueOf(from));
        }
        if (to > 0) {
            urlObject.addProperty("to", String.valueOf(to));
        }
        if (limit > 0) {
            urlObject.addProperty("limit", String.valueOf(limit));
        }

        System.out.println("Downloading eiffel-events...");

        RestTemplate restTemplate = new RestTemplate();

        ResponseEntity<Document[]> responseEntity = restTemplate.getForEntity(urlObject.toString(), Document[].class);
        Document[] documents = responseEntity.getBody();
        MediaType contentType = responseEntity.getHeaders().getContentType();
        HttpStatus statusCode = responseEntity.getStatusCode();

        System.out.println("Downloaded eiffel-events. Importing...");

        int total = documents.length;
        int count = 0;
        int lastPrint = count;

        long timeStart = Long.MAX_VALUE;
        long timeEnd = Long.MIN_VALUE;

        HashMap<String, Event> events = new HashMap<>();
        for (Document document : documents) {
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
                    event.setType("TestSuit");
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
                    Event redirect = new Event(event, target.getId());
                    events.put(event.getId(), redirect);
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

        return new Events(events, timeStart, timeEnd);
    }
}
