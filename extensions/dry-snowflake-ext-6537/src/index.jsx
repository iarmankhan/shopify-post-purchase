import { extend, render, useExtensionInput, BlockStack, Button, Heading, Image } from '@shopify/post-purchase-ui-extensions-react';

async function fetchPostPurchaseData() {
    // This is where you would make a request to your app server to fetch the data
    return {
        productTitle: 'Clay Plant Pot',
        productImageURL: 'https://cdn.shopify.com/s/files/1/0656/6277/9632/products/single-sprout-in-a-pot_925x_c49674dc-1f4a-43a8-aa22-2f6dc8812945.jpg?v=1658918072',
    };
}

extend('Checkout::PostPurchase::ShouldRender', async () => {
  return { render : true };
});
render('Checkout::PostPurchase::Render', () => <App />);
export function App() {
  const {done} = useExtensionInput();
  return (
    <BlockStack spacing="loose" alignment="center">
      <Heading>My first post-purchase extension</Heading>
      <Button submit onPress={done}>Click me</Button>
    </BlockStack>
  )
}