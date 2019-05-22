package com.ericsson.vici;

import com.ericsson.vici.entities.Eiffel.EiffelEvent;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EiffelEREventsResponse {
    int pageNo;
    int pageSize;
    int totalNumberItems;
    EiffelEvent[] items;
}
