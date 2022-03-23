var app = (function () {

    class Polygon{
        constructor(points){
            this.points = points;
        }
    }

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
        var socket = new SockJS('/stompendpoint');
        //Creación del stomp
        stompClient = Stomp.over(socket);
        //subscribe to /topic/TOPICXX when connections succeed
        //Conexión/Subscripción
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            var idConnection = $("#identificador").val();
             initCanvasEvent();
            console.log("idConection en ConnectAndSubscribe----" + idConnection);
            stompClient.subscribe('/topic/newpoint.'+ idConnection, function (eventbody) {
                var theObject=JSON.parse(eventbody.body);
                //Dibujar punto en todos las sesiones actuales
                addPointToCanvas(theObject);
            });
            stompClient.subscribe('/topic/newpolygon.'+ idConnection, function (eventbody) {
                var theObject = JSON.parse(eventbody.body);
                var polygon = new Polygon(theObject);
                //alert("SI RECIBÍ 3 PUNTOS O MÁS!!!   " + polygon.points);
                drawNewPolygon(polygon);

            });
        });

    };

    var drawNewPolygon = function(polygon){
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.fillStyle = '#8BADD0';
        console.log("antes del for ");
        console.log("Longitud" +  polygon.points.length );
        for(var i = 1; i <  5; i++){
            console.log("Entre al for ");
            if (i == 1 )ctx.moveTo(polygon.points[polygon.points.length - i].x, polygon.points[polygon.points.length - i].y);
            ctx.lineTo(polygon.points[polygon.points.length - i].x, polygon.points[polygon.points.length - i].y);
        }
        ctx.closePath();
        ctx.fill();
    };

    //Evento para el canvas
    var initCanvasEvent = function(){
        canvas.addEventListener("pointerdown", (event) => {
             //Retorna x e y del evento
             var point = getMousePosition(event);
             //addPointToCanvas(point);
             //Cuando se dibuja se envía la información a los suscritos(se llama a send)
             var idConnection = $("#identificador").val();
             //Las publicaciones se realicen al tópico asociado al identificador ingresado
             //stompClient.send('/topic/newpoint.'+ idConnection, {}, JSON.stringify(point));
             stompClient.send('/app/newpoint.'+ idConnection, {}, JSON.stringify(point));
        })

    };

    return {

        init: function () {
            var can = document.getElementById("canvas");
            //Dibujar punto cuando se reciba el evento
             initCanvasEvent();
            //websocket connection
            //connectAndSubscribe();
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            //console.info("publishing point at "+pt);
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
        },
        connectAndSubscribe:connectAndSubscribe
    }
})();