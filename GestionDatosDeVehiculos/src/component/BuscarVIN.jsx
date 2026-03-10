import { useState } from "react";

function BuscarVIN() {

  const [vin, setVin] = useState("");
  const [vehiculo, setVehiculo] = useState(null);

  const buscarVIN = async () => {

    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`
    );

    const data = await res.json();

    const marca = data.Results.find(r => r.Variable === "Make")?.Value;
    const modelo = data.Results.find(r => r.Variable === "Model")?.Value;
    const anio = data.Results.find(r => r.Variable === "Model Year")?.Value;

    setVehiculo({
      marca,
      modelo,
      anio
    });
  };

  return (
    <div>

      <h2>Buscar vehículo por VIN</h2>

      <input
        type="text"
        value={vin}
        onChange={(e) => setVin(e.target.value.toUpperCase())}
        placeholder="Ingrese VIN"
      />

      <button onClick={buscarVIN}>Buscar</button>

      {vehiculo && (
        <div>
          <p>Marca: {vehiculo.marca}</p>
          <p>Modelo: {vehiculo.modelo}</p>
          <p>Año: {vehiculo.anio}</p>
        </div>
      )}

    </div>
  );
}

export default BuscarVIN;