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
    "url": "/activatePresentation/:presentationId",
    "title": "Activate a specific presentation",
    "name": "Activate_Presentation",
    "group": "Presentations",
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
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n[{\n  \"status\": \"success\"\n}]",
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
  }
] });
