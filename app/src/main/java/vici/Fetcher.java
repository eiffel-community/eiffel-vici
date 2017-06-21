package vici;

import org.bson.Document;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import vici.entities.Event;
import vici.entities.Url;

import java.util.HashMap;

public class Fetcher {
    public Fetcher() {
    }

    public HashMap<String, Event> getEvents(String url) {
        return getEvents(url, 0, 0, 0);
    }

    public HashMap<String, Event> getEvents(String url, long from, long to, int limit) {
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


        RestTemplate restTemplate = new RestTemplate();

        ResponseEntity<Document[]> responseEntity = restTemplate.getForEntity(urlObject.toString(), Document[].class);
        Document[] documents = responseEntity.getBody();
        MediaType contentType = responseEntity.getHeaders().getContentType();
        HttpStatus statusCode = responseEntity.getStatusCode();

        HashMap<String, Event> events = new HashMap<>();
        for (Document document : documents) {
            Event event = new Event(document);
            events.put(event.getId(), event);
        }

        return events;
    }

}
