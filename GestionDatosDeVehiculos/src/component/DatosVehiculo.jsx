import "../assets/css/datosVehiculo.css";
import React, { useState } from "react";

const DatosVehiculo = () => {
  const [patente, setPatente] = useState("");
  const [vehiculo, setVehiculo] = useState(null);

  const buscar = async () => {
    const response = await fetch(
      `https://chile.getapi.cl/v1/vehicles/plate/${patente}`,
      {
      headers: {
        "x-api-key": "TU_API_KEY"
      }
    }
    );
    const data = await response.json();
    setVehiculo(data);
  };
  return (
    <>
      <input
        type="text"
        value={patente}
        onChange={(e) => setPatente(e.target.value.toUpperCase())}
        placeholder="Ej: ABCD12"
      />

      <button onClick={buscar}>Buscar</button>

      <h3>Identificación y especificaciones técnicas</h3>
      {vehiculo && (
        <table className="table">
          <tr>
            <td>
              <label>Fabricante</label>
              <input name="fabricante">{vehiculo.make}</input>
              <label>Modelo</label>
              <input name="modelo">{vehiculo.model}</input>
              <label>Variante</label>
              <input name="variante">{vehiculo.model}</input>
            </td>
          </tr>
          <tr>
            <td>
              <label>Tipo de carrocería</label>
              <input name="tipCarroceria"></input>
              <label>Año de fabricación</label>
              <input name="anhoFabricacion">{vehiculo.year}</input>
              <label>Año del modelo</label>
              <input name="anhoModelo">{vehiculo.year}</input>
            </td>
          </tr>
          <tr>
            <td>
              <label>Cilindrada</label>
              <input name="cilindrada" value={""}></input>
              <label>Potencia del sistema de propulsión</label>
              <input name="potencia" value={""}></input>
              <label>Tipo de combustible</label>
              <input name="combustible" value={""}></input>
            </td>
          </tr>
          <tr>
            <td>
              <label>Tipo de transmisión</label>
              <input name="transmision" value={""}></input>
              <label>Tipo de tracción</label>
              <input name="traccion" value={""}></input>
              <label>Color</label>
              <input name="color" value={""}></input>
            </td>
          </tr>
          <tr>
            <td>
              <label>Número de puertas</label>
              <input name="nroPuertas" value={""}></input>
              <label>Número de cilindros</label>
              <input name="nroCilindros" value={""}></input>
              <label>Número de marchas</label>
              <input name="nroCambios" value={""}></input>
            </td>
          </tr>
        </table>
      )}
    </>
  );
};

export default DatosVehiculo;
