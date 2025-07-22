const express = require('express');
const fs = require('fs').promises; // Using promises for async/await
const path = require('path');

const app = express();
app.use(express.json());

const PLATES_PATH = path.join(__dirname, 'plates.json');

// Helper function to read vehicle data
const readVehicleData = async () => {
  try {
    const data = await fs.readFile(PLATES_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading or parsing plates.json:", error);
    throw new Error('Could not process vehicle data file.');
  }
};

// Helper function to write vehicle data
const writeVehicleData = async (data) => {
  try {
    await fs.writeFile(PLATES_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Error writing to plates.json:", error);
    throw new Error('Could not save vehicle data.');
  }
};

app.post('/ipms/api/v1.1/vehicle/save/batch', async (req, res) => {
  const { vehicles: vehiclesToUpdate, enableEntranceGroup } = req.body;

  if (enableEntranceGroup !== '1') {
    return res.status(400).json({
      success: false,
      message: 'La modificación de grupos de entrada no está habilitada (enableEntranceGroup no es "1").',
    });
  }

  if (!vehiclesToUpdate || !Array.isArray(vehiclesToUpdate)) {
    return res.status(400).json({
      success: false,
      message: 'El campo "vehicles" es inválido o no fue proporcionado.',
    });
  }

  try {
    const vehicleData = await readVehicleData();
    const vehicleMap = new Map(vehicleData.vehicles.map(v => [v.id, v]));
    
    const responseVehicles = [];

    for (const v of vehiclesToUpdate) {
      if (vehicleMap.has(v.id)) {
        const existingVehicle = vehicleMap.get(v.id);
        existingVehicle.entranceGroupIds = v.entranceGroupIds || [];
        
        let status = 'UNCHANGED';
        if (existingVehicle.entranceGroupIds.includes('1')) {
          status = 'BLOCKED';
        } else if (existingVehicle.entranceGroupIds.includes('2')) {
          status = 'UNBLOCKED';
        }
        
        responseVehicles.push({
          id: existingVehicle.id,
          plateNo: existingVehicle.plateNo,
          status: status
        });
      }
    }

    await writeVehicleData(vehicleData);

    res.json({
      success: true,
      message: 'Vehículos procesados y actualizados correctamente.',
      processedCount: responseVehicles.length,
      vehicles: responseVehicles
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/ipms/api/v1.1/vehicle/fetch-by-plate-no', async (req, res) => {
  const { plateNo } = req.body;

  if (!plateNo) {
    return res.status(400).json({ code: 400, desc: 'plateNo is required' });
  }

  try {
    const vehicleData = await readVehicleData();
    const foundVehicle = vehicleData.vehicles.find(v => v.plateNo === plateNo);

    if (!foundVehicle) {
      return res.status(404).json({ code: 404, desc: 'Vehicle not found' });
    }

    // Respond with detailed, simulated data structure
    res.json({
      code: 0,
      desc: "Success",
      data: {
        id: foundVehicle.id,
        plateNo: foundVehicle.plateNo,
        entranceGroupIds: foundVehicle.entranceGroupIds,
        surveyStartTime: "1672531200",
        surveyEndTime: "2034748384",
        entranceStartTime: "1672531200",
        entranceEndTime: "2034748384",
        entranceLongTerm: "1",
        surveyGroups: [{
          groupId: "8",
          groupName: "Default Survey Group",
          groupColor: "1",
          remark: ""
        }],
        personInfo: {
          personId: `P-${foundVehicle.id}`,
          personName: "Mock Driver",
          companyName: "Mock Company Inc.",
          orgCode: "001",
          orgName: "All Persons and Vehicles",
          orgInfos: [{
            orgCode: "001",
            orgName: "All Persons and Vehicles"
          }],
          facePictures: [],
          email: "mock.driver@example.com",
          tel: "555-0101"
        },
        entranceRemaningTime: "3652",
        entranceEffectiveStatus: "1",
        surveyRemaningTime: "3652",
        surveyEffectiveStatus: "1",
        hasPermission: "1"
      }
    });

  } catch (error) {
    res.status(500).json({ code: 500, desc: error.message });
  }
});

app.post('/ipms/api/v1.1/entrance/vehicle-enter/record/fetch/page', async (req, res) => {
  const { page = 1, pageSize = 10 } = req.body;

  try {
    const vehicleData = await readVehicleData();
    const allVehicles = vehicleData.vehicles;
    
    const total = allVehicles.length;
    const pages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedVehicles = allVehicles.slice(start, end);

    res.json({
      success: true,
      message: 'Consulta exitosa',
      data: {
        records: paginatedVehicles.map(vehicle => ({
          id: vehicle.id,
          plateNo: vehicle.plateNo,
          enterTime: new Date().toISOString(), // Simulado
          channelName: 'Entrada Principal',
          entranceGroupIds: vehicle.entranceGroupIds // Incluyendo los grupos
        })),
        total: total,
        size: paginatedVehicles.length,
        current: page,
        pages: pages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mock DSS API corriendo en puerto ${PORT}`);
});
