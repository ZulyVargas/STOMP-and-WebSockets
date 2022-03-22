var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    //Cliente STOMP
    var stompClient = null;

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };


    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        //Creación del stomp
        stompClient = Stomp.over(socket);

        //subscribe to /topic/TOPICXX when connections succeed
        //Conexión/Subscripción
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint', function (eventbody) {
                var theObject=JSON.parse(eventbody.body);
                /*alert("COORDENADA X " + theObject.x + " COORDENADA Y " + theObject.y);
                alert(eventbody);*/
                //Dibujar punto en todos las sesiones actuales
                console.log(theObject);
                addPointToCanvas(theObject);
            });
        });

    };
    //Evento para el canvas
    var initCanvasEvent = function(){
        canvas.addEventListener("pointerdown", (event) => {
             //Retorna x e y del evento
             var point = getMousePosition(event);
             //addPointToCanvas(point);
             //Cuando se dibuja se envía la información a los suscritos(se llama a send)
             stompClient.send("/topic/newpoint", {}, JSON.stringify(point));
        })

    };

    return {

        init: function () {
            var can = document.getElementById("canvas");
            //Dibujar punto cuando se reciba el evento
             initCanvasEvent();
            //websocket connection
            connectAndSubscribe();
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            //publicar el evento
            //Parte 1.1
            stompClient.send("/topic/newpoint", {}, JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();