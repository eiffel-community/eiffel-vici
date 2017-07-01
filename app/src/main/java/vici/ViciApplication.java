package vici;

import com.google.gson.Gson;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import vici.entities.Event;

import java.util.ArrayList;

@SpringBootApplication
public class ViciApplication {

    public static final Logger log = LoggerFactory.getLogger(ViciApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(ViciApplication.class, args);


//        Fetcher fetcher = new Fetcher();
//        ArrayList<Event> events = fetcher.getMergedEvents("http://localhost:8080/api/dummy/eiffelevents");
//
//        Gson gson = new Gson();
//
//
//        System.out.print(gson.toJson(events));
    }
}
