package vici;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ViciApplication {

    public static final Logger log = LoggerFactory.getLogger(ViciApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(ViciApplication.class, args);
    }
}
