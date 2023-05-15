import DogBasicDetails from "./dogBasicDetails";
import DogOtherDetails from "./dogOtherDetails";

const PreviewDetails = () => {
  return (
    <>
      <DogBasicDetails fields={[]} />
      <DogOtherDetails />
    </>
  );
};
export default PreviewDetails;
