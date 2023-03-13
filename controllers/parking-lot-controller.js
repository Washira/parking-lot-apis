const database = require('../database');
const { NotFound } = require('../common/errors');
// const { getOnePlateNumber } = require('./plate-number-controller');

const ParkingLot = database.model('ParkingLot');
const PlateNumber = database.model('PlateNumber');

exports.postParkingLot = async (req, res, next) => {
  try {
    // Create new parking lot instance from payload.
    const newParkingLot = new ParkingLot(req.body);
    // Insert a parking lot document into database.
    const savedParkingLot = await newParkingLot.save();
    // Send the saved parking lot to the client.
    res.status(201).json(savedParkingLot);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getParkingLot = async (req, res, next) => {
  try {
    // The filter, fields, paging by prev middleware.
    const { filter, fields, options } = req;
    // Find and count parking lot documents by query string.
    const results = await Promise.all([
      ParkingLot.countDocuments(filter),
      ParkingLot.find(filter, fields, options),
    ]);
    // Send array of parking lot to the client.
    res.status(200).json({
      total: results[0],
      page: options.skip / options.limit || 0,
      data: results[1],
    });

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.getOneParkingLot = async (req, res, next) => {
  try {
    // Find a parking lot document by parking lot ID.
    const existParkingLot = await ParkingLot.findById(req.params.parkingLotId);
    // The resource could not be found?
    if (!existParkingLot) throw new NotFound('The resource could not be found.');
    // Send the parking lot to the client.
    res.status(200).json(existParkingLot);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

/*
  See status of a parking lot
 */
exports.getOneParkingLotStatus = async (req, res, next) => {
  try {
    // Find a parking lot document by parking lot ID.
    const existParkingLot = await ParkingLot.findById(req.params.parkingLotId);
    // The resource could not be found?
    if (!existParkingLot) throw new NotFound('The resource could not be found.');
    // Send the parking lot to the client.
    if (!existParkingLot.is_allocated) {
      res.status(200).send({ message: 'Available' });
    } else {
      res.status(200).send({ message: 'Allocated' });
    }
  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

/*
  Using find a first available parking lot by id (because it is nearest the exit)
 */
exports.getOneAvailableParkingLot = async (req, res, next) => {
  try {
    console.log('req.query ', req.query);
    // req.query  { size: 'l' }

    // // Find an available parking lot document by parking size.
    // const existParkingLot = await ParkingLot.findOne(req.params.parkingLotId);
    // // The resource could not be found?
    // if (!existParkingLot) throw new NotFound('The resource could not be found.');

    const results = await ParkingLot.findOne(req.query).exec();
    if (!results) throw new NotFound('The resource could not be found.');

    // Send the parking lot to the client.
    res.status(200).json(results);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.putParkingLot = async (req, res, next) => {
  try {
    // Find and update parking lot document by parking lot ID.
    const updatedParkingLot = await ParkingLot.findByIdAndUpdate(req.params.parkingLotId,
      req.body, { runValidators: true, new: true });
    // The resource could not be found?
    if (!updatedParkingLot) throw new NotFound('The resource could not be found.');
    // Send the updated parking lot to the client.
    res.status(200).json(updatedParkingLot);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

/*
  Using when any car go to PARK
 */
exports.parkOneCar = async (req, res, next) => {
  try {
    // Receive req.body is { number: <CAR_PLATE_NUMBER> }
    // Fetch a car by number first
    const getCarByPlateNumber = await PlateNumber.findOne(req.body).exec();

    if (getCarByPlateNumber.is_parked) {
      return res.status(200).send({ message: ` This car number ${getCarByPlateNumber.number} was parked.` });
    }

    // Fetch a parking lot available from car's size
    const getParkingLotBySize = await ParkingLot.findOne({
      size: getCarByPlateNumber.size,
      is_allocated: false,
    }).exec();

    // Update the car to be parked
    const updatedCarParked = await PlateNumber.findByIdAndUpdate(
      getCarByPlateNumber._id,
      { is_parked: true, parking_lot_id: getParkingLotBySize._id },
      { runValidators: true, new: true },
    );
    // res.status(200).json(updatedCarParked);

    // Update the parking lot to be allocated
    if (updatedCarParked) {
      const updatedParkingLot = await ParkingLot.findByIdAndUpdate(
        getParkingLotBySize._id,
        { plate_number_allocated: updatedCarParked, is_allocated: true },
        { runValidators: true, new: true },
      );
      if (!updatedParkingLot) throw new NotFound('The resource could not be found.');

      // Send the updated parking lot to the client.
      res.status(200).json(updatedParkingLot);

    } else {
      throw new NotFound('The resource could not be found.');
    }

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

/*
  Using when any car LEAVE the parking lot
*/
exports.leaveCar = async (req, res, next) => {
  try {
    // Receive req.body is { number: <CAR_PLATE_NUMBER> }
    // Fetch a car by number first
    const getCarByPlateNumber = await PlateNumber.findOne(req.body).exec();

    if (!getCarByPlateNumber.is_parked) {
      return res.status(200).send({ message: ` This car number ${getCarByPlateNumber.number} has not be parked.` });
    }

    // Fetch a parking lot available from car id
    const getParkingLotById = await ParkingLot.findOne({
      _id: getCarByPlateNumber.parking_lot_id,
    }).exec();

    // Update the car to be parked
    const updatedCarLeaved = await PlateNumber.findByIdAndUpdate(
      getCarByPlateNumber._id,
      { is_parked: false, parking_lot_id: '' },
      { runValidators: true, new: true },
    );

    // Update the parking lot to be available
    if (updatedCarLeaved) {
      const updatedParkingLotAvailable = await ParkingLot.findByIdAndUpdate(
        getParkingLotById._id,
        { plate_number_allocated: null, is_allocated: false },
        { runValidators: true, new: true },
      );
      if (!updatedParkingLotAvailable) throw new NotFound('The resource could not be found.');

      // Send the updated parking lot to the client.
      res.status(200).json(updatedParkingLotAvailable);

    } else {
      throw new NotFound('The resource could not be found.');
    }

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};

exports.deleteParkingLot = async (req, res, next) => {
  try {
    // Find and delete parking lot document by parking lot ID.
    const deletedParkingLot = await ParkingLot.findByIdAndDelete(req.params.parkingLotId);
    // The resource could not be found?
    if (!deletedParkingLot) throw new NotFound('The resource could not be found.');
    // Send 204 no content to the client.
    res.sendStatus(204).json(deletedParkingLot);

  } catch (err) {
    // Pass to error handler.
    next(err);
  }
};
