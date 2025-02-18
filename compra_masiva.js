import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

// Métrica personalizada para rastrear el estado de las respuestas
const statusTrend = new Trend('status_codes');

// Configuración de la prueba
export const options = {
    stages: [
        { duration: '5s', target: 5 },  // Escalar hasta 10 usuarios simultáneos en 5 segundos
        { duration: '5s', target: 0 },   // Reducir a 0 usuarios simultáneos en 5 segundos
    ],
};

// Datos del payload para la compra
const payload = JSON.stringify({
    producto: {
        id: 4,  // Asegúrate de que este campo esté presente
        nombre: "Laptop",
        precio: 1200.99,
        activado: true,  // Campo correcto en lugar de "activo"
    },
    direccion_envio: "Falsa 123, Ciudad Ejemplo",
    cantidad: 1,
    medio_pago: "Tarjeta de crédito",
});

// Encabezados para la solicitud
const headers = {
    'Content-Type': 'application/json',
};

export default function () {
    const BASE_URL = 'http://localhost:5000/api/v1/commerce/comprar'; // Endpoint de compras

    // Enviar la solicitud POST para simular una compra
    const res = http.post(BASE_URL, payload, { headers });

    // Registrar métricas de los estados HTTP
    statusTrend.add(res.status);

    // Validaciones básicas de la respuesta
    check(res, {
        'status is 200': (r) => r.status === 200,
        'response has id': (r) => r.json().id !== undefined,
    });

    // Simular un tiempo de espera entre solicitudes
    sleep(1);
}
