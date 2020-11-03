# Netlify Add-on Manifest Spec

The manifest endpoint of a Netlify add-on is used to return information about your service to the Netlify user and for validating input data during the creation/update of the provisioning process.

**The manifest includes:**

- `name` - The name of your add-on
- `description` - A brief description of your add-on
- `config` - The inputs required for the add-on to provision. These are input by the user via the CLI or via the netlify UI.

**Example Manifest**

```json
{
   "name": "Twilio addon",
   "description": "Adds twilio SMS number to your application",
   "admin_url": "https://www.twilio.com/login",
   "config": {
      "TwilioAccountSID": {
         "displayName": "Twilio Account SID",
         "description": "Number(s) required for service to function",
         "required": true
      },
      "TwilioAuthToken": {
         "displayName": "Twilio Account Authentication Token",
         "required": true
      }
   }
}
```

## Allowed Types

- [string](#string)
- [number](#number)
- [boolean](#boolean)
- [object](#object)
- [array](#array)
- [enum](#enum)

## Property values

These properties can be used across all `types`

- `displayName` - An alternate, human-friendly name for the property.
- `description` - description to user about property
- `type` - type of property
- `default` - default value to use
- `example` - example of value needed
- `required` - Specifies that the property is required or not. (Default true)

### `string`

These properties can be used for type `string`

- `pattern` - Regular expression that this string SHOULD match.
- `minLength` - Minimum length of the string. Value MUST be equal to or greater than 0.
- `maxLength` - Maximum length of the string. Value MUST be equal to or greater than 0.

**Example**

```yml
config:
  Email:
    type: string
    minLength: 6
    maxLength: 100
    pattern: /@/
```

### `number`

These properties can be used for type `number`

- `minimum` - The minimum value of the parameter
- `maximum` - The maximum value of the parameter

**Example**

```yml
config:
  UserNumber:
    type: number
    minimum: 4
  CountOfThings:
    type: number
    maximum: 10
```

### `boolean`

**Example**

```yml
config:
  isProUser:
    type: boolean
    description: Is your user account on pro level?
```

### `object`

These properties can be used for type `object`

- `minProperties` - The minimum number of properties allowed for instances of this type.
- `maxProperties` -  The maximum number of properties allowed for instances of this type.

**Example**

```yml
config:
  Person:
    type: object
    properties:
      name:
        required: true
        type: string
```


### `array`

These properties can be used for type `array`

- `uniqueItems` - Boolean value that indicates if items in the array MUST be unique.
- `minItems` - Minimum amount of items in array. Value MUST be equal to or greater than 0.
- `maxItems` - Maximum amount of items in array. Value MUST be equal to or greater than 0.

**Example**

```yml
config:
  Emails:
    type: array
    minItems: 1
    uniqueItems: true
    example:
    	- tim@time.com
    	- foo@bar.com
```

### `enum`

**Example**

```yml
config:
  formatType:
    type: enum
    description: What format do you want?
    values: [ .json, .xml ]
 ```

 ```yml
 config:
   templateType:
     type: enum
     description: Which type of template?
     values:
       - Node
       - Java
       - Python
  ```

## Full Example

```yml
name: My Awesome Integration
description: This addon does XYZ.
admin_url: https://my-admin-url.com
config:
  MyShortHandStringValue: string # Shorthand string
  TwilioAuthToken: # no type defaults to string
    displayName: Twilio Account Authentication Token
  TwilioAccountSID:
    displayName: Twilio Account SID
  	description: Number(s) required for service to function
  	type: string
  	required: true
  	minLength: 2
    maxLength: 10
  	pattern: "[0-9|-]+"
  Email:
    type: string
    minLength: 2
    maxLength: 6
    pattern: .+\@.+\..+
  Age: number # Shorthand number
  Person: # Object type example
  	type: object
  	properties:
      firstname: string # Shorthand string required
      lastname:  string
   		title?: string # optional value because trailing ?
  IsMarried:
    type: boolean
```

## Validation Flow

Below is an example of the validation flow a user runs through when setting up a Netlify Add-on

```
             ┌────────────────────────────────────────┐
             │                                        │
             │       User initializes creation        │
             │               of add-on                │
             │                                        │
             └────────────────────────────────────────┘
                                  │
                                  ▼
             ┌────────────────────────────────────────┐
             │                                        │
             │       /manifest endpoint called        │
             │    & required configuration values     │
             │          are returned to user          │
             │                                        │
             └────────────────────────────────────────┘
                                  │
                                  │
                                  ▼
             ┌────────────────────────────────────────┐
             │                                        │
             │     User is prompted to input any      │
             │            required config             │
             │                                        │
             └────────────────────────────────────────┘
                                  │
                                  │
                                  ▼
             ┌────────────────────────────────────────┐
             │                                        │
             │            Input Validation            │
             │         against manifest types         │
             │                                        │
             │                                        │
             └────────────────────────────────────────┘
                                  │
                            Inputs valid?
                                  │
               ┌────────No────────┴─────────Yes───────┐
               │                                      │
               │                                      │
               │                                      │
               ▼                                      ▼
┌─────────────────────────────┐          ┌────────────────────────┐
│                             │          │                        │
│                             │          │                        │
│  Prompt user to fix inputs  │          │     Create Add-on      │
│                             │          │                        │
│                             │          │                        │
└─────────────────────────────┘          └────────────────────────┘
```
