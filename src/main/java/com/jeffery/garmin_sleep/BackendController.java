package com.jeffery.garmin_sleep;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")  // 基本路徑前綴
public class BackendController {

    @GetMapping("/test")
    public String testEndpoint() {
        return "後端連線成功！";
    }
}
