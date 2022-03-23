package edu.eci.arsw.collabpaint;

import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class STOMPMessagesHandler {
    //Lista concurrente
    private  Map<String , ArrayList<Point>> conexiones =new ConcurrentHashMap<>();

    @Autowired
    SimpMessagingTemplate msgt;

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:"+pt + numdibujo);
        msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);
        //Guardar el punto
        if (conexiones.get(numdibujo) != null ){
            conexiones.get(numdibujo).add(pt);
            if (conexiones.get(numdibujo).size()%4 == 0){
                System.out.println("Entre al if en JAVA-----------------");
                msgt.convertAndSend("/topic/newpolygon."+numdibujo, conexiones.get(numdibujo));

            }
        }
        else {
            ArrayList<Point> newList = new ArrayList<>();
            newList.add(pt);
            conexiones.put(numdibujo, newList);
        }

    }
}