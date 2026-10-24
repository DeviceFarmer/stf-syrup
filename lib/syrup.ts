import parallel from './parallel'
import serial from './serial'

// Attaches the serial factory to the parallel one itself rather than to a
// copy, as the CoffeeScript version did, so `require('./parallel').serial`
// works too once the package is loaded.
parallel.serial = serial

export = parallel
