# Backend Setup and Database Updates

## Database Updates

If you're setting up a new database, run the `Programming-Prep.sql` script to create the database and tables:

```bash
mysql -u your_username -p < Programming-Prep.sql
```

If you have an existing database and need to add the view and download count columns, run the `update_notes_table.sql` script:

```bash
mysql -u your_username -p programming_prep < update_notes_table.sql
```

## API Endpoints

### Notes

- `GET /api/notes?user_id=<user_id>` - Get all notes for a user
- `POST /api/notes/add` - Add a new note
- `DELETE /api/notes/:id` - Delete a note (soft delete)
- `POST /api/notes/:id/view` - Increment view count for a note
- `POST /api/notes/:id/download` - Increment download count for a note

### Quiz

- `POST /addQuiz` - Add a new quiz

## Running the Server

```bash
npm start
```

The server will run on http://localhost:5000 by default.