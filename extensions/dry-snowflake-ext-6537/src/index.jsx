import React from 'react';
import {
    extend,
    render,
    useExtensionInput,
    BlockStack,
    Layout,
    CalloutBanner,
    TextContainer,
    Text,
    TextBlock,
    Tiles,
    Button,
    Heading,
    Image,
    Separator
} from '@shopify/post-purchase-ui-extensions-react';

async function fetchPostPurchaseData() {
    // This is where you would make a request to your app server to fetch the data
    const res = await fetch('http://localhost:8077/offer')
    return (await res.json())
}

extend('Checkout::PostPurchase::ShouldRender', async ({storage}) => {
    const postPurchaseData = await fetchPostPurchaseData()
    await storage.update(postPurchaseData)
    return {render: true};
});
render('Checkout::PostPurchase::Render', () => <App/>);

export function App() {
    const {storage, inputData, calculateChangeset, applyChangeset, done} = useExtensionInput();
    const [loading, setLoading] = React.useState(true)
    const [calculatedPurchase, setCalculatedPurchase] = React.useState()

    React.useEffect(() => {
        async function calculatePurchase() {
            const result = await calculateChangeset({changes})

            setCalculatedPurchase(result.calculatedPurchase)
            setLoading(false)
        }

        calculatePurchase()
    }, [])

    const {variantId, productTitle, productImageURL, productDescription} = storage.initialData

    const changes = [{type: 'add_variant', variantId, quantity: 1}]

    // Extracting Price Values from calculatedPurchase
    const shipping = calculatedPurchase?.addedShippingLines[0]?.priceSet?.presentmentMoney?.amount
    const taxes = calculatedPurchase?.addedTaxLines[0]?.priceSet?.presentmentMoney?.amount
    const total = calculatedPurchase?.totalOutstandingSet?.presentmentMoney?.amount
    const discountedPrice = calculatedPurchase?.updatedLineItems[0]?.totalPriceSet?.presentmentMoney?.amount
    const originalPrice = calculatedPurchase?.updatedLineItems[0]?.priceSet?.presentmentMoney?.amount

    async function acceptOffer() {
        setLoading(true)

        const token = await fetch('http://localhost:8077/sign-changeset', {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                referenceId: inputData.initialPurchase.referenceId,
                changes,
                token: inputData.token
            })
        })
            .then(res => res.json())
            .then(res => res.token)

        await applyChangeset(token)

        done()
    }

    function declineOffer() {
        setLoading(true)
        done()
    }


    return (
        <BlockStack spacing="loose">
            <CalloutBanner>
                <BlockStack spacing="tight">
                    <TextContainer>
                        <Text size="medium" emphasized>
                            Special Offer
                        </Text>
                    </TextContainer>
                    <TextContainer>
                        <Text size="medium">
                            Add the {productTitle} to your order and
                        </Text>
                        <Text size="medium" emphasized>
                            {" "} save 15%
                        </Text>
                    </TextContainer>
                </BlockStack>
            </CalloutBanner>

            <Layout media={[
                {viewportSize: 'small', sizes: [1, 0, 1], maxInlineSize: 0.9},
                {viewportSize: 'medium', sizes: [532, 0, 1], maxInlineSize: 420},
                {viewportSize: 'large', sizes: [560, 38, 340]}
            ]}>
                <Image description='product image' source={productImageURL}/>
                <BlockStack/>
                <BlockStack spacing="tight">
                    <Heading>{productTitle}</Heading>
                    <PriceHeader
                        discountedPrice={discountedPrice}
                        originalPrice={originalPrice}
                        loading={!calculatedPurchase}
                    />
                    <ProductDescription textLines={productDescription}/>

                    <BlockStack spacing="tight">
                        <Separator/>
                        <MoneyLine label="Subtotal" amount={discountedPrice} loading={!calculatedPurchase}/>
                        <MoneyLine label="Shipping" amount={shipping} loading={!calculatedPurchase}/>
                        <MoneyLine label="Taxes" amount={taxes} loading={!calculatedPurchase}/>
                        <Separator/>
                        <MoneySummary label="Total" amount={total} loading={!calculatedPurchase}/>
                    </BlockStack>

                    <BlockStack>
                        <Button submit loading={loading} onPress={acceptOffer}>Pay Now
                            - {formatCurrency(total)}</Button>
                        <Button submit loading={loading} onPress={declineOffer}>Decline this offer</Button>
                    </BlockStack>
                </BlockStack>
            </Layout>

        </BlockStack>
    )
}

function PriceHeader({discountedPrice, originalPrice, loading}) {
    return (
        <TextContainer alignment="leading" spacing="loose">
            <Text role="deletion" size="large">
                {!loading && formatCurrency(originalPrice)}
            </Text>
            <Text emphasized size="large" apperance="critical">
                {' '}
                {!loading && formatCurrency(discountedPrice)}
            </Text>
        </TextContainer>
    )
}

function ProductDescription({textLines}) {
    return (
        <BlockStack spacing="xtight">
            {textLines.map((text, index) => (
                <TextBlock key={index} subdued>
                    {text?.replace('<p>', '')?.replace('</p>','')}
                </TextBlock>
            ))}
        </BlockStack>
    );
}

function MoneyLine({label, amount, loading = false}) {
    return (
        <Tiles>
            <TextBlock size="small">
                {label}
            </TextBlock>
            <TextContainer alignment="trailing">
                <TextBlock emphasized size="small">
                    {loading ? "-" : formatCurrency(amount)}
                </TextBlock>
            </TextContainer>
        </Tiles>
    )
}

function MoneySummary({label, amount}) {
    return (
        <Tiles>
            <TextBlock size="medium" emphasized>
                {label}
            </TextBlock>
            <TextContainer alignment="trailing">
                <TextBlock emphasized size="medium">
                    {formatCurrency(amount)}
                </TextBlock>
            </TextContainer>
        </Tiles>
    )
}

function formatCurrency(amount) {
    if (!amount || parseInt(amount) === 0) {
        return 'Free';
    }
    return `$${amount}`;
}