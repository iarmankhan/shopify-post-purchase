const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const fetch = require("node-fetch");
const { GraphQLClient, gql } = require("graphql-request");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ?? 8077;
const API_VERSION = process.env.API_VERSION ?? '2022-07';

const endpoint = `https://${process.env.DEV_STORE}.myshopify.com/admin/api/${API_VERSION}/graphql.json`;
const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
    },
});

app.get("/offer", async (req, res) => {
    const query = gql`
        query ($productId: ID!) {
            product(id: $productId) {
                id
                title
                featuredImage {
                    url
                }
                descriptionHtml
                variants(first: 1) {
                    edges {
                        node {
                            id
                            price
                            compareAtPrice
                        }
                    }
                }
            }
        }
    `;

    // console.log("Product ID: ", process.env.PRODUCT_ID);

    const result = await graphQLClient.request(query, {
        productId: `gid://shopify/Product/${process.env.PRODUCT_ID}`,
    });

    const product = result.product;
    // console.log(product)

    const variant = result.product?.variants?.edges[0].node;

    const initialData = {
        variantId: variant?.id?.split("gid://shopify/ProductVariant/")[1],
        productTitle: product?.title,
        productImageURL: product?.featuredImage.url,
        productDescription: product?.descriptionHtml.split(/<br.*?>/),
        originalPrice: variant?.compareAtPrice,
        discountedPrice: variant?.price
    };

    res.send(initialData);
});

app.post("/sign-changeset", (req, res) => {
    const decodedToken = jwt.verify(
        req.body.token,
        process.env.SHOPIFY_API_SECRET
    );
    const decodedReferenceId =
        decodedToken.input_data.initialPurchase.referenceId;

    if (decodedReferenceId !== req.body.referenceId) {
        res.status(400).render();
    }

    const payload = {
        iss: process.env.SHOPIFY_API_KEY,
        jti: uuidv4(),
        iat: Date.now(),
        sub: req.body.referenceId,
        changes: req.body.changes,
    };

    const token = jwt.sign(payload, process.env.SHOPIFY_API_SECRET);
    res.json({ token });
});

app.listen(PORT, () =>
    console.log(`App is listening at http://localhost:${PORT}`)
);
