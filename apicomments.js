
/**
 * @api {post} api/slides/:slideId/activate Activate a specific slide
 * @apiName Activate Slide
 * @apiGroup Slides
 * @apiPermission ADMIN ONLY
 * @apiParam {Number} slideId Slides' unique ID.
 *
 * @apiSuccess (200) {String} ACTIVATED Slide Activated.
 * @apiSuccessExample {String} ACTIVATED
 *    HTTP/1.1 200 OK
 *    ["ACTIVATED"]
 *
 * @apiError (500) UN_AUTHORIZED This user ID is not allowed to modify this presentation.
 * @apiErrorExample {String} UN_AUTHORIZED
 * HTTP/1.1 500
 * [
 *  "UN_AUTHORIZED"
 * ]
 */