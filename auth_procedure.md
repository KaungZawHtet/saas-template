### Description.


This is the possible standard operation procedure to consider when building authentication system in overall applications.


## Database

User table can be used. Notable 8 fields are
    1. Id
        Can use auto-gen UUID. Can Hide at response
    2. Email
        Must be unique, i.e validate duplication before inserting into table
    3. User Name
        Can be used for display purpose.
    4. First Name and Last Name
        Optional
    5. confirmationToken
        a. When email is insertable into the table, we can generate a token at that place for email confimation.
        b. Then send the confirmation token to the user at that place too
        c. Consider this kind of link to send `http://${process.env.BASE_URL}/email-confirm?token=${confirmationToken}`
            i.e, you can create that GET api point with token query
    6. emailConfimed
        boolean. Can use this at email-confirm api point
    7. created_at
        Mostly, can config this field on using orm and it's model
    8. updated_at
        Similar to created_at

## Api points

1. Register Api
    Here are algo for handling register api
        a. Can use POST method
        b. Accept body data (name, email, emailConfirmed, password, etc. )
        c. Check email and emailConfirmed
        d. Check email already existed
        e. In case of all ok,
            1. generate hash for pw
            2. generate token for emailConfirmation service
            3. insert user data into table
            4. do sending email service (email confirmation service)
                    a. token and email is main input
                    b. include email-confirmation api with token
                    c. send the mail from sort of ur contact email to user email from input
            5. remind user to check their email for email confirmation at api response

2. Email Confirmation api
    a. User will receive email confirmation link from email confirmation letter
    b. On clicking the link, then it will call the api
    c. check token is valid
    d. if valid, change to true at emailConfirmed
    e. give some response that makes sense

3. Login api
    a. POST API with three main fields: email, pw and remember me
    b. check pw and emailConfirmed
    c. If all ok, generate token by jwt based-on remember me (jwt has exp field normally)
    d. Now, user can access other authorized api by using the token as header

4. Google auth api
    a. This is GET API
    b. redirect to a google link that includes three things
            1. main correct url
            2. client id
            3. redirect uri

    c. it will appear a google box and select ur credential
    d. then, it will re-direect to ur callback api

4. Google callback api
    a. Be careful, in this call back GET api, u need to call two other apis (GET and POST) to retrieve actual profile data from google. detail below
    b. This is also GET api
    c. google auth api automatically redirect to this api after selecting credential stuff
    d. will receive `code query` from the callback api
    e. retrieve the `code` and use it at oauth2 POST api (eg. link: https://oauth2.googleapis.com/token). The post api has fields such as client_id, client_secret, code, redirect_uri, grant_type in the body too.
    f. because of using right client id, secret and others, it respond with access token
    g. then, we retrieve actual info by access token at the link (https://www.googleapis.com/oauth2/v1/userinfo). This is GET api and token is at Authorization header( eg. "Authorization" : "Bear token")
    h. use the profile data and insert it into table
    i. generate the jwt token by using the profile data
    j. respond token with something that make sense



5. authenticator middleware
    a. extract the authorization header
    b. decode the profile info like email and id
    c. if u can access with data with the decoded info, it's login now
    d. pass the correct info to your actual controller





