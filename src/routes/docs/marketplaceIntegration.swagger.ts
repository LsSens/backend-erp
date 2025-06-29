/**
 * @swagger
 * /marketplace-integrations:
 *   get:
 *     summary: List marketplace integrations
 *     description: Returns a paginated list of marketplace integrations. Requires MANAGER permission.
 *     tags: [Marketplace Integrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of marketplace integrations returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 items:
 *                   - id: "123e4567-e89b-12d3-a456-426614174000"
 *                     userId: "123e4567-e89b-12d3-a456-426614174001"
 *                     marketplaceType: "mercadolivre"
 *                     accessToken: "valid-access-token"
 *                     refreshToken: "valid-refresh-token"
 *                     sellerId: "seller123"
 *                     storeName: "Minha Loja"
 *                     status: "active"
 *                     lastSyncAt: "2024-01-01T00:00:00.000Z"
 *                     errorMessage: null
 *                     createdAt: "2024-01-01T00:00:00.000Z"
 *                     updatedAt: "2024-01-01T00:00:00.000Z"
 *                 total: 1
 *                 page: 1
 *                 limit: 10
 *                 totalPages: 1
 *       401:
 *         description: Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /marketplace-integrations/{id}:
 *   get:
 *     summary: Get marketplace integration by ID
 *     description: Returns data for a specific marketplace integration. Requires USER permission.
 *     tags: [Marketplace Integrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique marketplace integration ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Marketplace integration found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 userId: "123e4567-e89b-12d3-a456-426614174001"
 *                 marketplaceType: "mercadolivre"
 *                 accessToken: "valid-access-token"
 *                 refreshToken: "valid-refresh-token"
 *                 sellerId: "seller123"
 *                 storeName: "Minha Loja"
 *                 status: "active"
 *                 lastSyncAt: "2024-01-01T00:00:00.000Z"
 *                 errorMessage: null
 *                 createdAt: "2024-01-01T00:00:00.000Z"
 *                 updatedAt: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Marketplace integration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /marketplace-integrations/user/{userId}:
 *   get:
 *     summary: Get marketplace integrations by user ID
 *     description: Returns all marketplace integrations for a specific user. Requires USER permission.
 *     tags: [Marketplace Integrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique user ID
 *         example: "123e4567-e89b-12d3-a456-426614174001"
 *     responses:
 *       200:
 *         description: User marketplace integrations found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   userId: "123e4567-e89b-12d3-a456-426614174001"
 *                   marketplaceType: "mercadolivre"
 *                   accessToken: "valid-access-token"
 *                   refreshToken: "valid-refresh-token"
 *                   sellerId: "seller123"
 *                   storeName: "Minha Loja"
 *                   status: "active"
 *                   lastSyncAt: "2024-01-01T00:00:00.000Z"
 *                   errorMessage: null
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *                   updatedAt: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /marketplace-integrations/type/{marketplaceType}:
 *   get:
 *     summary: Get marketplace integrations by marketplace type
 *     description: Returns all marketplace integrations for a specific marketplace type. Requires MANAGER permission.
 *     tags: [Marketplace Integrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: marketplaceType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [mercadolivre, shopee, amazon, magazine_luiza, b2w]
 *         description: Marketplace type
 *         example: "mercadolivre"
 *     responses:
 *       200:
 *         description: Marketplace integrations by type found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   userId: "123e4567-e89b-12d3-a456-426614174001"
 *                   marketplaceType: "mercadolivre"
 *                   accessToken: "valid-access-token"
 *                   refreshToken: "valid-refresh-token"
 *                   sellerId: "seller123"
 *                   storeName: "Minha Loja"
 *                   status: "active"
 *                   lastSyncAt: "2024-01-01T00:00:00.000Z"
 *                   errorMessage: null
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *                   updatedAt: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: Invalid marketplace type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /marketplace-integrations:
 *   post:
 *     summary: Create new marketplace integration
 *     description: Creates a new marketplace integration for a user. Requires USER permission.
 *     tags: [Marketplace Integrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMarketplaceIntegrationRequest'
 *           example:
 *             userId: "123e4567-e89b-12d3-a456-426614174001"
 *             marketplaceType: "mercadolivre"
 *             accessToken: "valid-access-token"
 *             refreshToken: "valid-refresh-token"
 *             sellerId: "seller123"
 *             storeName: "Minha Loja"
 *     responses:
 *       201:
 *         description: Marketplace integration created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 userId: "123e4567-e89b-12d3-a456-426614174001"
 *                 marketplaceType: "mercadolivre"
 *                 accessToken: "valid-access-token"
 *                 refreshToken: "valid-refresh-token"
 *                 sellerId: "seller123"
 *                 storeName: "Minha Loja"
 *                 status: "pending"
 *                 lastSyncAt: null
 *                 errorMessage: null
 *                 createdAt: "2024-01-01T00:00:00.000Z"
 *                 updatedAt: "2024-01-01T00:00:00.000Z"
 *               message: "Marketplace integration created successfully"
 *       400:
 *         description: Invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Integration already exists for this user and marketplace
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /marketplace-integrations/{id}:
 *   put:
 *     summary: Update marketplace integration
 *     description: Updates an existing marketplace integration. Requires USER permission.
 *     tags: [Marketplace Integrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique marketplace integration ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMarketplaceIntegrationRequest'
 *           example:
 *             accessToken: "new-access-token"
 *             refreshToken: "new-refresh-token"
 *             sellerId: "new-seller-id"
 *             storeName: "Nova Loja"
 *             status: "active"
 *     responses:
 *       200:
 *         description: Marketplace integration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 userId: "123e4567-e89b-12d3-a456-426614174001"
 *                 marketplaceType: "mercadolivre"
 *                 accessToken: "new-access-token"
 *                 refreshToken: "new-refresh-token"
 *                 sellerId: "new-seller-id"
 *                 storeName: "Nova Loja"
 *                 status: "active"
 *                 lastSyncAt: "2024-01-01T00:00:00.000Z"
 *                 errorMessage: null
 *                 createdAt: "2024-01-01T00:00:00.000Z"
 *                 updatedAt: "2024-01-01T00:00:00.000Z"
 *               message: "Marketplace integration updated successfully"
 *       400:
 *         description: Invalid data or ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Marketplace integration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /marketplace-integrations/{userId}/{marketplaceType}/{id}:
 *   delete:
 *     summary: Delete marketplace integration
 *     description: Deletes a marketplace integration. Requires USER permission.
 *     tags: [Marketplace Integrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *         example: "123e4567-e89b-12d3-a456-426614174001"
 *       - in: path
 *         name: marketplaceType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [mercadolivre, shopee, amazon, magazine_luiza, b2w]
 *         description: Marketplace type
 *         example: "mercadolivre"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Marketplace integration ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Marketplace integration deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Marketplace integration deleted successfully"
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Marketplace integration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /marketplace-integrations/{id}/status:
 *   patch:
 *     summary: Update integration status
 *     description: Updates the status of a marketplace integration. Requires USER permission.
 *     tags: [Marketplace Integrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique marketplace integration ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending, error]
 *                 description: New status for the integration
 *               errorMessage:
 *                 type: string
 *                 description: Error message if status is error
 *           example:
 *             status: "active"
 *             errorMessage: "Connection restored"
 *     responses:
 *       200:
 *         description: Integration status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 userId: "123e4567-e89b-12d3-a456-426614174001"
 *                 marketplaceType: "mercadolivre"
 *                 accessToken: "valid-access-token"
 *                 refreshToken: "valid-refresh-token"
 *                 sellerId: "seller123"
 *                 storeName: "Minha Loja"
 *                 status: "active"
 *                 lastSyncAt: "2024-01-01T00:00:00.000Z"
 *                 errorMessage: null
 *                 createdAt: "2024-01-01T00:00:00.000Z"
 *                 updatedAt: "2024-01-01T00:00:00.000Z"
 *               message: "Integration status updated successfully"
 *       400:
 *         description: Invalid data or ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Marketplace integration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /marketplace-integrations/{id}/refresh-token:
 *   patch:
 *     summary: Refresh access token
 *     description: Refreshes the access token for a marketplace integration. Requires USER permission.
 *     tags: [Marketplace Integrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique marketplace integration ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessToken
 *             properties:
 *               accessToken:
 *                 type: string
 *                 description: New access token
 *               refreshToken:
 *                 type: string
 *                 description: New refresh token (optional)
 *           example:
 *             accessToken: "new-access-token"
 *             refreshToken: "new-refresh-token"
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 userId: "123e4567-e89b-12d3-a456-426614174001"
 *                 marketplaceType: "mercadolivre"
 *                 accessToken: "new-access-token"
 *                 refreshToken: "new-refresh-token"
 *                 sellerId: "seller123"
 *                 storeName: "Minha Loja"
 *                 status: "active"
 *                 lastSyncAt: "2024-01-01T00:00:00.000Z"
 *                 errorMessage: null
 *                 createdAt: "2024-01-01T00:00:00.000Z"
 *                 updatedAt: "2024-01-01T00:00:00.000Z"
 *               message: "Access token refreshed successfully"
 *       400:
 *         description: Invalid data or ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Marketplace integration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
