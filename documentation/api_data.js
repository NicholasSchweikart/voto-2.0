define({ "api": [
  {
    "type": "get",
    "url": "api/classes",
    "title": "Get all classes for a user",
    "name": "Request_all_user_classes",
    "group": "Classes",
    "permission": [
      {
        "name": "ALL"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Users access token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "json",
            "optional": false,
            "field": "classes",
            "description": "<p>Array of class data</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "The user object and a new access token",
          "content": " HTTP/1.1 200 OK\n [\n {\n\"classes\": [\n    {\n        \"classId\": 1,\n        \"userId\": 1,\n        \"className\": \"English 101\",\n        \"totalPresentations\": 7,\n        \"dateCreated\": \"2018-01-10T02:46:49.000Z\",\n        \"description\": null,\n        \"timeStamp\": 1515548809\n    },\n    {\n         \"classId\": 2,\n        \"userId\": 1,\n        \"className\": \"Stats 101\",\n        \"totalPresentations\": 3,\n         \"dateCreated\": \"2018-01-10T02:46:49.000Z\",\n         \"description\": null,\n         \"timeStamp\": 1515548809\n     }\n ]\n  }\n ]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/classes.js",
    "groupTitle": "Classes"
  },
  {
    "type": "post",
    "url": "api/login",
    "title": "Login as a specific user",
    "name": "Login_User",
    "group": "Login",
    "permission": [
      {
        "name": "ALL"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userName",
            "description": "<p>Users unique name.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Users account password.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request Example",
          "content": "{\"userName\":\"User123\", \"password\":\"password\"}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "success",
            "description": "<p>Login worked.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "The user object and a new access token",
          "content": "   HTTP/1.1 200 OK\n   [{\n  \"user\": {\n      \"userId\": 1,\n      \"firstName\": \"John\",\n      \"lastName\": \"Doe\",\n      \"userName\": \"User123\",\n      \"creationDate\": \"2017-08-23T03:35:50.000Z\",\n      \"type\": \"T\",\n      \"email\": \"teacher@teacher.com\"\n  },\n  \"token\": \"eyJhbGciOiJ....\"\n}]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/login.js",
    "groupTitle": "Login"
  },
  {
    "type": "post",
    "url": "api/presentations/:presentationId/activate",
    "title": "Activate a specific presentation",
    "name": "Activate_Presentation",
    "group": "Presentations",
    "permission": [
      {
        "name": "ADMIN ONLY"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "presentationId",
            "description": "<p>Presentations unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "success",
            "description": "<p>Presentation Activated.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "ACTIVATED This Presentation ID is now active.",
          "content": "HTTP/1.1 200 OK\n[\"ACTIVATED\"]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "500": [
          {
            "group": "500",
            "optional": false,
            "field": "UN_AUTHORIZED",
            "description": "<p>This user ID is not allowed to activate this presentation.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "error",
          "content": "HTTP/1.1 500\n[\n \"UN_AUTHORIZED\"\n]",
          "type": "String"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/presentationRoutes.js",
    "groupTitle": "Presentations"
  },
  {
    "type": "post",
    "url": "api/presentations/:presentationId/activate",
    "title": "Activate a specific presentation",
    "name": "De_Activate_Presentation",
    "group": "Presentations",
    "permission": [
      {
        "name": "ADMIN ONLY"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "presentationId",
            "description": "<p>Presentations unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "DE_ACTIVATED",
            "description": "<p>Presentation Activated.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "DE_ACTIVATED",
          "content": "HTTP/1.1 200 OK\n[\"DE_ACTIVATED\"]",
          "type": "String"
        }
      ]
    },
    "error": {
      "fields": {
        "500": [
          {
            "group": "500",
            "optional": false,
            "field": "UN_AUTHORIZED",
            "description": "<p>This user ID is not allowed to modify this presentation.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "UN_AUTHORIZED",
          "content": "HTTP/1.1 500\n[\n \"UN_AUTHORIZED\"\n]",
          "type": "String"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/presentationRoutes.js",
    "groupTitle": "Presentations"
  },
  {
    "type": "get",
    "url": "api/presentation/:presentationId",
    "title": "Get a specific presentation",
    "name": "Request_Presentation",
    "group": "Presentations",
    "permission": [
      {
        "name": "ALL"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "presentationId",
            "description": "<p>The unique ID of the presentation to retrieve.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "json",
            "optional": false,
            "field": "presentation",
            "description": "<p>Presentation json data</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "The user object and a new access token",
          "content": " HTTP/1.1 200 OK\n [{\n    \"presentationId\": 1,\n     \"userId\": 1,\n     \"classId\": 1,\n     \"title\": \"asdf\",\n     \"isActive\": 0,\n     \"totalSlides\": 0,\n     \"useCount\": 31,\n     \"description\": \"asdf\",\n     \"isFavorite\": 0,\n     \"dateLastUsed\": \"2018-01-10T02:17:49.000Z\",\n     \"dateCreated\": \"2017-08-23T05:42:03.000Z\"\n}\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/presentationRoutes.js",
    "groupTitle": "Presentations"
  },
  {
    "type": "get",
    "url": "api/presentations/:presentationId/allSlides",
    "title": "Get all slides for a presentation",
    "name": "Request_Presentation_Slides",
    "group": "Presentations",
    "permission": [
      {
        "name": "ADMIN ONLY"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "presentationId",
            "description": "<p>The unique ID of the presentation to retrieve slides for.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "json",
            "optional": false,
            "field": "slides",
            "description": "<p>Array of slides</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "The user object and a new access token",
          "content": " HTTP/1.1 200 OK\n [{\n        \"slideId\": 5,\n        \"userId\": 1,\n        \"classId\": 1,\n        \"presentationId\": 7,\n        \"imgFileName\": \"9e7f6fb9-adde-4459-bdc6-e5b17a3b1a42_viklander.jpg\",\n        \"isActive\": 0,\n        \"dateCreated\": \"2017-08-26T20:47:09.000Z\",\n        \"question\": null,\n        \"orderNumber\": 0,\n        \"correctAnswer\": null,\n        \"timeStamp\": 1503776829\n    },\n     {\n         \"slideId\": 6,\n         \"userId\": 1,\n         \"classId\": 1,\n         \"presentationId\": 7,\n         \"imgFileName\": \"27305fbf-8631-47d9-98a2-7bb127a7ce53_viklander.jpg\",\n         \"isActive\": 0,\n         \"dateCreated\": \"2017-08-27T14:35:26.000Z\",\n         \"question\": null,\n         \"orderNumber\": 0,\n         \"correctAnswer\": null,\n         \"timeStamp\": 1503840926\n     }\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/presentationRoutes.js",
    "groupTitle": "Presentations"
  },
  {
    "type": "post",
    "url": "/saveNewPresentation",
    "title": "Request to save a new presentation",
    "permission": [
      {
        "name": "admin"
      }
    ],
    "group": "Presentations",
    "name": "Save_New_Presentation",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "presentationId",
            "description": "<p>Presentations unique ID.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "classId",
            "description": "<p>Presentations parent class.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>Presentations new title.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>Presentations quick description.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request Example",
          "content": "{\"classId\":1, \"title\":\"PHY 101\", \"description\":\"Physics...\"}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "success",
            "description": "<p>Presentation Activated.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "The new presentation data",
          "content": "HTTP/1.1 200 OK\n[{\n  \"presentationId:\"1\",\n  \"classId\":\"1\",\n  \"title\":\"PHY 101\",\n  \"description\":\"Physics...\",\n  \"totalSlides\":2,\n  \"useCount\":0,\n  \"dateLastUsed\": 201923943,\n  \"dateCreated\": 2010210312\n}]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/presentationRoutes.js",
    "groupTitle": "Presentations"
  },
  {
    "type": "post",
    "url": "api/slides/:slideId/activate",
    "title": "Activate a specific slide",
    "name": "Activate_Slide",
    "group": "Slides",
    "permission": [
      {
        "name": "ADMIN ONLY"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "slideId",
            "description": "<p>Slides' unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "ACTIVATED",
            "description": "<p>Slide Activated.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "ACTIVATED",
          "content": "HTTP/1.1 200 OK\n[\"ACTIVATED\"]",
          "type": "String"
        }
      ]
    },
    "error": {
      "fields": {
        "500": [
          {
            "group": "500",
            "optional": false,
            "field": "UN_AUTHORIZED",
            "description": "<p>This user ID is not allowed to modify this presentation.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "UN_AUTHORIZED",
          "content": "HTTP/1.1 500\n[\n \"UN_AUTHORIZED\"\n]",
          "type": "String"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/slides.js",
    "groupTitle": "Slides"
  },
  {
    "type": "post",
    "url": "api/slides/:slideId/de-activate",
    "title": "De-Activate a specific slide",
    "name": "De_Activate_Slide",
    "group": "Slides",
    "permission": [
      {
        "name": "ADMIN ONLY"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "slideId",
            "description": "<p>Slides' unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "DE_ACTIVATED",
            "description": "<p>Slide De-Activated.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "DE_ACTIVATED",
          "content": "HTTP/1.1 200 OK\n[\"DE_ACTIVATED\"]",
          "type": "String"
        }
      ]
    },
    "error": {
      "fields": {
        "500": [
          {
            "group": "500",
            "optional": false,
            "field": "UN_AUTHORIZED",
            "description": "<p>This user ID is not allowed to modify this presentation.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "UN_AUTHORIZED",
          "content": "HTTP/1.1 500\n[\n \"UN_AUTHORIZED\"\n]",
          "type": "String"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/slides.js",
    "groupTitle": "Slides"
  },
  {
    "type": "post",
    "url": "api/users/createUser",
    "title": "Add a new user to the system.",
    "name": "Create_New_User",
    "group": "User",
    "permission": [
      {
        "name": "ALL"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "firstName",
            "description": "<p>The users first name.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "lastName",
            "description": "<p>The users last name.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userName",
            "description": "<p>The users intended user name.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>The users email account.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>The users new password.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>The users type (S = Student, T = Teacher).</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request Example",
          "content": "{\"userName\":\"User123\", \"password\":\"password\", \"email\":\"t@t.com\",\"type\":\"T\", \"firstName\":\"Bob\", \"lastName\":\"Villa\"}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "type": "json",
            "optional": false,
            "field": "user",
            "description": "<p>The new user.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "The user object and a new access token",
          "content": "   HTTP/1.1 200 OK\n   [{\n      \"user\": {\n      \"userId\": 1,\n      \"firstName\": \"John\",\n      \"lastName\": \"Doe\",\n      \"userName\": \"User123\",\n      \"creationDate\": \"2017-08-23T03:35:50.000Z\",\n      \"type\": \"T\",\n      \"email\": \"teacher@teacher.com\"\n  },\n  \"token\": \"eyJhbGciOiJ....\"\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "500": [
          {
            "group": "500",
            "optional": false,
            "field": "USER_NAME_IN_USE",
            "description": "<p>This user name is already taken</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "error",
          "content": "HTTP/1.1 500\n[\n {\"error\":\"USER_NAME_IN_USE\"}\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/users.js",
    "groupTitle": "User"
  },
  {
    "type": "delete",
    "url": "api/users/",
    "title": "Remove a user from the system.",
    "name": "Delete_User",
    "group": "User",
    "permission": [
      {
        "name": "ANY USER WITH TOKEN"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Users access token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "json",
            "optional": false,
            "field": "user",
            "description": "<p>The new user.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "The user object and a new access token",
          "content": "HTTP/1.1 200 OK\n[\"success\"]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "500": [
          {
            "group": "500",
            "optional": false,
            "field": "USER_DOESNT_EXIST",
            "description": "<p>This user ID is invalid</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "error",
          "content": "HTTP/1.1 500\n[\n {\"error\":\"USER_DOESNT_EXIST\"}\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/users.js",
    "groupTitle": "User"
  }
] });
