import { Request, Response } from 'express';
import pool from '../config/db';

export const submitBillboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, type, size, latitude, longitude } = req.body;
    const file = req.file;

    // Validate inputs
    if (!userId || !type || !size || !latitude || !longitude || !file) {
      res.status(400).json({ error: 'Missing required fields or photo.' });
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ error: 'Invalid coordinates.' });
      return;
    }

    // A real app would upload the file to S3 or similar and get a URL.
    // Here we'll mock the URL or save the local path for the sake of the exercise.
    const imageUrl = `/uploads/${file.filename}`;

    // CRITICAL GEOSPATIAL RULE (Anti-duplication)
    // Check if an official billboard already exists within a 15-meter radius.
    // Note: Cast to 'geography' to ensure ST_DWithin uses meters instead of degrees for SRID 4326.
    const duplicateCheckQuery = `
      SELECT id 
      FROM billboards 
      WHERE ST_DWithin(
        location::geography, 
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 
        15
      ) 
      LIMIT 1;
    `;
    
    // PostGIS expects (Longitude, Latitude)
    const { rows: duplicates } = await pool.query(duplicateCheckQuery, [lng, lat]);

    if (duplicates.length > 0) {
      res.status(409).json({ 
        error: 'Un panneau publicitaire est déjà répertorié à cet emplacement exact.' 
      });
      return;
    }

    // Insert into pending_billboards
    const insertQuery = `
      INSERT INTO pending_billboards (user_id, type, size, image_url, location, status)
      VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), 'pending')
      RETURNING id, created_at;
    `;

    const { rows: inserted } = await pool.query(insertQuery, [
      userId, 
      type, 
      size, 
      imageUrl, 
      lng, 
      lat
    ]);

    res.status(201).json({
      message: 'Billboard submitted successfully awaiting moderation.',
      data: inserted[0]
    });
  } catch (error) {
    console.error('Error submitting billboard:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
