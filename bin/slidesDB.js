const mySQL = require("./mySqlUtility");

/**
 * Saves a new slide in the DB for a user.
 * @param newSlide the presentation fields to save
 * @param userId the userId for the owner of this slide and its accompanying class/pres
 * @param _cb callback function
 */
exports.saveNewSlide = (userId,newSlide, _cb) => {
  console.log(`Attempting to create a slide for presentationId: ${newSlide.presentationId}`);

  if (
    !newSlide ||
    !newSlide.presentationId ||
    !newSlide.imgFileName ||
    !newSlide.question ||
    !newSlide.orderNumber ||
    !newSlide.correctAnswer
  ) {
    return _cb("failed one or more empty slide fields");
  }

  const sql = "CALL save_new_slide(?, ?, ?, ?, ?, ?)";
  const params = [
    userId,
    newSlide.presentationId,
    newSlide.imgFileName,
    newSlide.question,
    newSlide.orderNumber,
    newSlide.correctAnswer
  ];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      return _cb(err.code);
    }

    if (data.length === 0) {
      return _cb("ER_FAILED_TO_CREATE_SLIDE");
    }
    _cb(null, data[0]);
  });
};

/**
 * Updates a presentation that already exists.
 * @param userId
 * @param slideUpdate the userid for the owner of this presentation
 * @param _cb callback
 */
exports.updateSlide = (userId, slideUpdate, _cb) => {

  if (!slideUpdate) {
    return _cb("failed one or more empty session parameters");
  }

  console.log(`Updating presentationId ${slideUpdate.presentationId} for userId ${userId}`);

  const sql = "CALL update_slide(?,?,?,?,?,?)";
  const params = [
    userId,
    slideUpdate.presentationId,
    slideUpdate.classId,
    slideUpdate.imgFileName,
    slideUpdate.question,
    slideUpdate.orderNumber,
    slideUpdate.correctAnswer
  ];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      return _cb(err.code);
    }

    if (data.length === 0) {
      return _cb("SLIDE_UPDATE_FAILED");
    }

    return _cb(null, data[0]);
  });
};

/**
 * Removes a slide from the data base.
 * @param userId the userId of the slide owner
 * @param slideId the slideId to delete
 * @param _cb callback
 */
exports.deleteSlide = (userId, slideId, _cb) => {
  if (!slideId || !slideId) {
    _cb("ER_NEED_ID");
    return;
  }

  console.log(`Deleting slideId: ${slideId}`);

  const sql = "CALL delete_slide(?,?)";
  const params = [slideId];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      return _cb(err.code);
    }

    if (data.length === 0) {
      return _cb("SLIDE_UPDATE_FAILED");
    }

    return _cb(null, data[0]);
  });
};

/**
 * Changes state of a slide in the DB.
 * @param userId the owners userId for authorization.
 * @param slideId the slide to alter activation on.
 * @param newState the new state to put the slide in. Active = true
 * @param _cb callback
 */
exports.toggleSlide = (userId, slideId, newState, _cb) => {

  if (!userId || !slideId || !newState) {
    return _cb("ER_NEED_IDS");
  }

  console.log(`Toggling sldieId ${slideId} -> ${newState}`);

  const sql = "call toggle_slide(?, ?, ?)";
  const params = [userId, slideId, newState];

  mySQL.query(sql, params, (err, slideId) => {
    if (err) {
      return _cb(err.code);
    }

    if (slideId.length === 0) {
      return _cb("ERR_TOGGLE_FAILURE");
    }

    // Return the presentation ID for socket updating
    return _cb(null, slideId[0]);
  });
};

/**
 * Gets a single slide from the DB.
 * @param userId the owners userId for authorization.
 * @param slideId the slide to retrieve
 * @param _cb callback
 */
exports.getSlide = (userId, slideId, _cb) => {

  if (!userId || !slideId) {
    return _cb("ER_NEED_IDS");
  }

  console.log(`Getting sldieId ${slideId}`);

  const sql = "call get_slide(?, ?)";
  const params = [userId, slideId];

  mySQL.query(sql, params, (err, slide) => {
    if (err) {
      return _cb(err.code);
    }

    if (slide.length === 0) {
      return _cb("ERR_TOGGLE_FAILURE");
    }

    return _cb(null, slide);
  });
};


exports.saveResponse = (userId, slideId, response, _cb) => {

  if (!userId || !response) {
    _cb("ER_NO_USER_ID_OR_RESPONSE");
    return;
  }

  console.log(`userId [${userId}] saving response [${JSON.stringify(response)}]`);

  const sql = "CALL save_response(?,?,?)";
  const params = [userId, questionId, response.answer];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      return _cb(err.code);
    }

    if (data.length === 0) {
      return _cb("ER_SAVING_RESPONSE");
    }

    _cb(null, true);
  });
};