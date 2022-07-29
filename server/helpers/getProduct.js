const {
  findAllProduct,
  findProductById,
  findFeatureById,
  findStylesById,
  findPhotosByStyleid,
  findSkusByStyleid,
} = require('../../db/queries');

const getAllProduct = (req, res) => {
  findAllProduct()
    .then((productData) => res.status(200).send(productData))
    .catch((err) => {
      res.status(500).send(err);
      console.log('error in getAllProduct: ', err);
    });
};

const getProductById = (req, res) => {
  const id = req.url.slice(10);

  findProductById(id)
    .then((productData) => {
      findFeatureById(id).then((featureData) => {
        const productObj = productData;
        productObj.features = featureData;
        res.status(200).send(productData);
      });
    })
    .catch((err) => {
      res.status(500).send(err);
      console.log('error in getProductById: ', err);
    });
};

const getStyleById = (req, res) => {
  const id = req.url.slice(10, -7);

  findStylesById(id)
    .then((styleData) => {
      const styleObj = {};
      styleObj.product_id = styleData[0].productid;
      styleObj.results = styleData;
      // return styleObj;
      const photoPromises = styleObj.results.map((style) => {
        style.photos = null;
        style.skus = null;

        return findPhotosByStyleid(style.id)
          .then((photoData) => {
            style.photos = photoData;
          })
          // .then(() => {
          //   findSkusByStyleid(style.id)
          //     .then((skuData) => {
          //       // console.log('sku Data: ', skuData)
          //       style.skus = skuData;
          //     })
          //     .catch((err) => console.log('error in findSkus: ', err));
          //     // })
          //     // .catch((err) => console.log('error in findPhotos: ', err))
          // })
          .catch((err) => console.log('error: ', err));
      });
      // const skuPromises = styleObj.results.map((style) => (
      //   findSkusByStyleid(style.id)
      //     .then((skuData) => {
      //       // console.log('sku Data: ', skuData);
      //       style.skus = skuData;
      //     })
      //     .catch((err) => console.log('error in findPhotos: ', err))
      // ));

      // photoPromises.concat(skuPromises);

      const result = Promise.all(photoPromises);
      return result.then(() => (styleObj));
    })
    .then((finalStyleObj) => res.status(200).send(finalStyleObj))
    .catch((err) => {
      res.status(500).send(err);
      console.log('error in getStyleById: ', err);
    });
};

module.exports = { getAllProduct, getProductById, getStyleById };
