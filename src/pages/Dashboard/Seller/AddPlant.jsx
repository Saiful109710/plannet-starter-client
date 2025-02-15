import { Helmet } from "react-helmet-async";
import AddPlantForm from "../../../components/Form/AddPlantForm";
import { imageUpload } from "../../../api/utils";
import useAuth from "../../../hooks/useAuth";
import { useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AddPlant = () => {
  const { user } = useAuth();
  const [uploadBtnText, setUploadBtnText] = useState({ name: "Upload Image" });
  const [loading, setLoading] = useState(false);
  const axiosSecure = useAxiosSecure()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true)

    const form = e.target;
    const name = form.name.value;
    const description = form.description.value;
    const category = form.category.value;
    const price = parseFloat(form.price.value);
    const quantity = parseInt(form.quantity.value);
    const image = form.image.files[0];
    const image_url = await imageUpload(image);

    // seller info

    const sellerInfo = {
      name: user?.displayName,
      image: user?.photoURL,
      email: user?.email,
    };

    // create plant data object

    const plantData = {
      name,
      description,
      category,
      price,
      quantity,
      image: image_url,
      sellerInfo,
    };

    console.table(plantData);

    // save plant in db

    try{
        // post req

        const {data} = await axiosSecure.post('/plants',plantData)
        console.log(data)
        toast.success('Data added Successfully')
        navigate('/dashboard/my-inventory')

    }catch(err){
      console.log(err)
    }finally{
      setLoading(false)
    }
  };
  return (
    <div>
      <Helmet>
        <title>Add Plant | Dashboard</title>
      </Helmet>

      {/* Form */}
      <AddPlantForm
        handleSubmit={handleSubmit}
        uploadBtnText={uploadBtnText}
        setUploadBtnText={setUploadBtnText}
        loading={loading}
        setLoading={setLoading}
      />
    </div>
  );
};

export default AddPlant;
