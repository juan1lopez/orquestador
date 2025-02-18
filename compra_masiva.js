import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { check, sleep } from 'k6';

// Métrica personalizada para rastrear el estado de las respuestas
const statusTrend = new Trend('status_codes');

export const options = {
    stages: [
        { duration: '10s', target: 50 }, // Escalar hasta 60 usuarios simultáneos en 15 segundos
        { duration: '10s', target: 50 }, // Mantener 60 usuarios simultáneos durante 30 segundos
        { duration: '2s', target: 0 },  // Reducir a 0 usuarios simultáneos en 15 segundos
    ],
};

export default function () {
    const BASE_URL = 'http://localhost:5000/api/v1/commerce/comprar'; // URL del servidor de desarrollo

    // Datos de ejemplo para simular una compra
    const payload = JSON.stringify({
        "producto": {
          "id": 4,
          "nombre": "Laptop",
          "precio": 1200.99,
          "activado": true
        },
        "direccion_envio": "Falsa 123, Ciudad Ejemplo",
        "cantidad": 1,
        "medio_pago": "Tarjeta de crédito"
      });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Realizar la solicitud POST al endpoint de compra
    const res = http.post(BASE_URL, payload, params);

    // Registrar métricas de los estados HTTP
    statusTrend.add(res.status);

    // Validaciones básicas
    check(res, {
        'status is 200': (r) => r.status === 200,
        'status is 400': (r) => r.status === 400,
    });

    sleep(1); // Simular espera de 1 segundo entre solicitudes
}