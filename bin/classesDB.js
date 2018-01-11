const mySQL = require("./mySqlUtility");

/**
 * Saves a new class in the DB for a user.
 * @param newClass the class object to save: '{}'
 * @param userId the userId for this session
 * @param _cb callback function
 */
exports.saveNewClass = (newClass, userId, _cb) => {
  console.log(`Attempting to save a new class for USER: ${userId}`);

  if (
    !newClass ||
    !newClass.title ||
    !newClass.className
  ) {
    return _cb("failed one or more empty session parameters");
  }

  const sql = "CALL save_new_class(?, ?)";

  const params = [
    userId,
    newClass.name
  ];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      return _cb(err.code);
    } else {
      if (data.length === 0) {
        return _cb("ER_FAILED_TO_SAVE_CLASS");
      }

      // Return the new classId to the caller.
      _cb(null, data[0]);
    }
  });
};

exports.updateClass = (userId, classUpdate,_cb)=>{

  if (!classUpdate) {
    return _cb("failed one or more empty session parameters");
  }

  console.log(`Updating classId ${classId} for userId ${userId}`);

  //TODO finish implamentation
  const sql = "CALL update_class(?)";
  const params = [
    classUpdate.userId
  ];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      return _cb(err.code);
    }

    if (data.length === 0) {
      return _cb("CLASS_UPDATE_FAILED");
    }

    _cb(null, data[0]);
  });
};

/**
 * Authorizes a specific userId to access a classId when it is active
 * @param adminId the userId of the class owner
 * @param userId the userId to modify access permissions for
 * @param classId the classId of the class to authorize for this user
 * @param allowAccess 1 or 0 to specify the new rights to apply
 * @param _cb callback
 */
exports.changeUserAccessPrivilage = (adminId, userId, classId, allowAccess, _cb) => {

  if (!userId || !adminId || !classId || !allowAccess) {
    return _cb("ER_EMPTY_PARAMETERS");
  }

  console.log(`userId [${adminId}] is modifying access for userId [${userId}] :: classId [${classId}]`);
  const sql = "CALL change_user_authorization(?, ?, ?, ?)";
  const params = [adminId, userId, classId, allowAccess];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      return _cb(err.code);
    }

    if(data.length === 0){
      return _cb("FAILED_TO_CHANGE_ACCESS");
    }

    // Return success to the caller.
    return _cb(null, true);
  });
};

/**
 * Returns an array of all classes associated with a userId.
 * @param userId the userId to get sessions for
 * @param _cb callback
 */
exports.getAllClasses = (userId, _cb) => {
  if (!userId) {
    return _cb("failed no userId");
  }

  console.log(`Retrieving all classes for user: ${userId}`);

  const sql = "CALL get_all_classes(?)";
  const params = [userId];

  mySQL.query(sql, params, (err, classes) => {
    if (err) {
      return _cb(err.code);
    }

    // Return the records.
    _cb(null, classes[0]);
  });
};



