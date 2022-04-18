const Pool = require("pg").Pool;
const pool = new Pool({
  user: "me",
  host: "localhost",
  database: "api",
  password: "password",
  port: 5432,
});

const getUsers = (request, response) => {
  pool.query("SELECT * FROM users ORDER BY id ASC", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getUserById = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query("SELECT * FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const createUser = (request, response) => {
  const { phone } = request.body;
  const otp = Math.floor(1000 + Math.random() * 9000);
  setTimeout(() => {
    pool.query("UPDATE users SET otp = '' WHERE phone = $1", [phone]);
  }, 60000);

  pool.query(
    "SELECT EXISTS (SELECT * FROM users WHERE phone = $1)",
    [phone],
    (error, results) => {
      if (error) {
        throw error;
      }
      if (results.rows[0].exists) {
        pool.query("UPDATE users SET otp = $1 WHERE phone = $2", [otp, phone]);
      } else {
        pool.query("INSERT INTO users (phone,otp) VALUES ($1,$2)", [
          phone,
          otp,
        ]);
      }
      response.status(200).json({
        status: "success",
        message: `User successfully added`,
        otp: otp,
      });
    }
  );
};

const updateUser = (request, response) => {
  const id = parseInt(request.params.id);
  const { phone } = request.body;

  pool.query(
    "UPDATE users SET name = $1, email = $2 WHERE id = $3",
    [phone, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response
        .status(200)
        .json({ status: "success", message: `User successfully modified` });
    }
  );
};

const deleteUser = (request, response) => {
  const { phone } = parseInt(request.body);

  pool.query(
    "DELETE FROM users WHERE phone = $1",
    [phone],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json({
        status: "success",
        message: "User successfully deleted!",
      });
    }
  );
};

const checkOtp = (request, response) => {
  const { phone, otp } = request.body;

  pool.query(
    "SELECT (phone,otp) FROM users WHERE phone IN ($1) AND otp IN ($2) ORDER BY id DESC LIMIT 1",
    [phone, otp],
    (error, results) => {
      if (error) {
        throw error;
      }
      if (results.rows.length > 0) {
        response
          .status(200)
          .json({ status: "success", message: "Otp verified" });
        pool.query("UPDATE users SET otp = '' WHERE phone = $1", [phone]);
      } else {
        response.status(400).json({
          status: "failed",
          message: "Check phone number and otp again",
        });
      }
    }
  );
};

const resendOtp = (request, response) => {
  const { phone } = request.body;
  const otp = Math.floor(1000 + Math.random() * 9000);
  setTimeout(() => {
    pool.query("UPDATE users SET otp = '' WHERE phone = $1", [phone]);
  }, 60000);

  pool.query(
    "SELECT EXISTS (SELECT * FROM users WHERE phone = $1)",
    [phone],
    (error, results) => {
      if (error) {
        throw error;
      }
      if (results.rows[0].exists) {
        pool.query("UPDATE users SET otp = $1 WHERE phone = $2", [otp, phone]);
        response.status(200).json({
          status: "success",
          message: `New otp sent`,
          otp: otp,
        });
      } else {
        response.status(401).json({
          status: "failed",
          message: `Enter valid number`,
        });
      }
    }
  );
};

const getRestaurantWithMenu = (request, response) => {
  pool.query(
    "select restaurant.id, restaurant.name, restaurant.country, restaurant.image, restaurant.address,restaurant.city, restaurant.type, restaurant.location,restaurant.operating_hours, json_agg(json_build_object('menu_id', menu.menu_item_id,'menu_name',menu.menu_name, 'menu_price',menu.menu_price, 'menu_image',menu.menu_image, 'description',menu.description, 'menu_type',menu.menu_type)) as menu from restaurant join menu  on restaurant.id = menu.id group by restaurant.id order by restaurant.id ASC",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  checkOtp,
  resendOtp,
  getRestaurantWithMenu,
};
