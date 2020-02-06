require('dotenv').config();
const app = require('../src/app');
const knex = require('knex');
const makeBookmarksArray = require('./bookmarks.fixtures');

describe(`Bookmark Service Object`, function() {
    let db
    before('establish knex connection', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db);
    })
    after('disconnect from db', () => db.destroy());

    before('clean the table', () => db('bookmarks').truncate());

    this.afterEach('cleanup', () => db('bookmarks').truncate());
    
    describe('GET /bookmarks', () => {

        context('given no bookmarks', () =>{
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .expect(200, [])
            })
        })

        context('Given there are bookmarks', () => {
            const testBookmarks = makeBookmarksArray();

            beforeEach('inserts bookmarks', () => {
                return db 
                    .into('bookmarks')
                    .insert(testBookmarks)
            })
            it('responds with 200 and list of bookmarks', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .expect(200, testBookmarks)
            })
        })
    })
    describe('GET /bookmarks/:id', () => {

        context('given no bookmark', () => {
            it('responds with a 404', () => {
                const bookmarkId = 12345654
                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .expect(404, { error: { message: `Bookmark with id of ${bookmarkId} not found` } })
            })
        })

        context('Given there are bookmarks', () => {
            const testBookmarks = makeBookmarksArray();
            beforeEach('inserts bookmarks', () => {
                return db 
                    .into('bookmarks')
                    .insert(testBookmarks)
            })
            it('responds with 200 and bookmark with id', () => {
                const bookmarkId = 2;
                const expectedBookmark = testBookmarks[bookmarkId - 1]
                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .expect(200, expectedBookmark)
            })
        })
    })

})