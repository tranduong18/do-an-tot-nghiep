package vn.jobhunter.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class SseService {
    private final Map<Long, List<SseEmitter>> userEmitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(0L); // no-timeout
        userEmitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> remove(userId, emitter));
        emitter.onTimeout(() -> remove(userId, emitter));
        emitter.onError(e -> remove(userId, emitter));

        try { emitter.send(SseEmitter.event().name("ping").data("ok")); } catch (Exception ignored) {}
        return emitter;
    }

    public void sendToUser(Long userId, Object payload) {
        List<SseEmitter> list = userEmitters.getOrDefault(userId, List.of());
        if (list.isEmpty()) return;

        List<SseEmitter> dead = new ArrayList<>();
        for (SseEmitter e : list) {
            try {
                e.send(SseEmitter.event().name("resumeStatus").data(payload));
            } catch (Exception ex) {
                dead.add(e);
            }
        }
        list.removeAll(dead);
        if (list.isEmpty()) userEmitters.remove(userId);
    }

    private void remove(Long userId, SseEmitter emitter) {
        List<SseEmitter> list = userEmitters.get(userId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) userEmitters.remove(userId);
        }
    }
}
