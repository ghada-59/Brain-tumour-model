import torch
from monai.losses import DiceCELoss
from monai.networks.nets import UNet


def get_device() -> torch.device:
    if torch.cuda.is_available():
        return torch.device("cuda")
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return torch.device("mps")
    return torch.device("cpu")


def build_model() -> UNet:
    """2D U-Net (NOT a true 3D network), random initialization, no pretrained weights."""
    return UNet(
        spatial_dims=2, in_channels=4, out_channels=4,
        channels=(16, 32, 64, 128), strides=(2, 2, 2), num_res_units=2,
    )


def build_loss() -> DiceCELoss:
    return DiceCELoss(to_onehot_y=True, softmax=True)
